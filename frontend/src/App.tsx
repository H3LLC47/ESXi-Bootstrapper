import { useState } from "react";

import { generateDesign, validateDesign } from "./api/client";
import { ResultsPage } from "./pages/ResultsPage";
import { WizardPage } from "./pages/WizardPage";
import type { DesignConfig, GenerationResponse, ValidationResponse } from "./types/design";
import { defaultDesign } from "./utils/defaults";

export default function App() {
  const [config, setConfig] = useState<DesignConfig>(defaultDesign);
  const [activeStep, setActiveStep] = useState(0);
  const [validation, setValidation] = useState<ValidationResponse | null>(null);
  const [result, setResult] = useState<GenerationResponse | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleValidate = async () => {
    try {
      const response = await validateDesign(config);
      setValidation(response);
    } catch (error) {
      setValidation({
        valid: false,
        errors: [
          {
            severity: "error",
            path: "api",
            message: error instanceof Error ? error.message : "Unable to validate design."
          }
        ],
        warnings: []
      });
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await generateDesign(config);
      setValidation(response);
      setResult(response);
    } catch (error) {
      setValidation({
        valid: false,
        errors: [
          {
            severity: "error",
            path: "api",
            message: error instanceof Error ? error.message : "Unable to generate output."
          }
        ],
        warnings: []
      });
    } finally {
      setGenerating(false);
    }
  };

  if (result) {
    return (
      <ResultsPage
        result={result}
        onStartOver={() => {
          setResult(null);
          setActiveStep(0);
        }}
      />
    );
  }

  return (
    <WizardPage
      config={config}
      activeStep={activeStep}
      validation={validation}
      generating={generating}
      onConfigChange={setConfig}
      onBack={() => setActiveStep((current) => Math.max(current - 1, 0))}
      onNext={() => setActiveStep((current) => Math.min(current + 1, 5))}
      onValidate={handleValidate}
      onGenerate={handleGenerate}
    />
  );
}

