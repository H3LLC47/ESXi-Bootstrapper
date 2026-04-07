import { CodeBlock } from "../components/CodeBlock";
import { ValidationPanel } from "../components/ValidationPanel";
import type { GenerationResponse } from "../types/design";

interface ResultsPageProps {
  result: GenerationResponse;
  onStartOver: () => void;
}

export function ResultsPage({ result, onStartOver }: ResultsPageProps) {
  return (
    <div className="results-shell">
      <header className="results-header">
        <div>
          <h1>Generated Design Output</h1>
          <p>Review deployment steps, validation results, and the generated PowerCLI script.</p>
        </div>
        <button type="button" className="secondary-button" onClick={onStartOver}>
          Back to wizard
        </button>
      </header>

      <ValidationPanel title="Validation Errors" messages={result.errors} tone="error" />
      <ValidationPanel title="Validation Warnings" messages={result.warnings} tone="warning" />

      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>Deployment Plan</h2>
          </div>
        </header>
        <ol className="plan-list">
          {result.deployment_plan.map((step, index) => (
            <li key={step.title}>
              <strong>
                {index + 1}. {step.title}
              </strong>
              <span>{step.detail}</span>
            </li>
          ))}
        </ol>
      </section>

      <CodeBlock label="Generated PowerCLI Script" content={result.powercli_script} />
    </div>
  );
}

