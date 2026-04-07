import type { ComponentType } from "react";

import type { DesignConfig, ValidationResponse } from "../types/design";
import { StepLayout } from "../components/StepLayout";
import { ValidationPanel } from "../components/ValidationPanel";
import { EnvironmentStep } from "../steps/EnvironmentStep";
import { GuestNetworksStep } from "../steps/GuestNetworksStep";
import { HostsStep } from "../steps/HostsStep";
import { NetworkStep } from "../steps/NetworkStep";
import { ReviewStep } from "../steps/ReviewStep";
import { StorageStep } from "../steps/StorageStep";

interface StepProps {
  config: DesignConfig;
  onChange: (next: DesignConfig) => void;
}

interface WizardPageProps {
  config: DesignConfig;
  activeStep: number;
  validation: ValidationResponse | null;
  generating: boolean;
  onConfigChange: (next: DesignConfig) => void;
  onBack: () => void;
  onNext: () => void;
  onValidate: () => void;
  onGenerate: () => void;
}

const stepMeta: Array<{
  title: string;
  description: string;
  render: ComponentType<StepProps>;
}> = [
  {
    title: "Environment",
    description: "Capture the vCenter, datacenter, cluster, and distributed switch design.",
    render: EnvironmentStep
  },
  {
    title: "VMkernel Networks",
    description: "Define the dedicated port groups for management and vMotion VMkernel traffic.",
    render: NetworkStep
  },
  {
    title: "Storage Networks",
    description: "Define the two dedicated storage VLANs and their required isolated uplink behavior.",
    render: StorageStep
  },
  {
    title: "Guest Networks",
    description: "Define guest VM port groups only. Guest port groups never carry VMkernel adapters.",
    render: GuestNetworksStep
  },
  {
    title: "Hosts",
    description: "Add hosts, uplink mappings, and per-host VMkernel IP assignments.",
    render: HostsStep
  },
  {
    title: "Review",
    description: "Confirm the design before generating the deployment plan and PowerCLI output.",
    render: ReviewStep
  }
] as const;

export function WizardPage({
  config,
  activeStep,
  validation,
  generating,
  onConfigChange,
  onBack,
  onNext,
  onValidate,
  onGenerate
}: WizardPageProps) {
  const step = stepMeta[activeStep];
  const StepComponent = step.render;
  const isReviewStep = activeStep === stepMeta.length - 1;

  return (
    <div className="page-shell">
      <aside className="sidebar">
        <h1>vSphere Bootstrap Designer</h1>
        <p>
          Design post-install vSphere cluster networking with strict validation around dedicated
          VMkernel port groups and storage isolation.
        </p>
        <ol className="step-list">
          {stepMeta.map((item, index) => (
            <li key={item.title} className={index === activeStep ? "active" : ""}>
              <span>{index + 1}</span>
              <div>
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </div>
            </li>
          ))}
        </ol>
      </aside>

      <main className="content">
        <StepLayout
          title={step.title}
          description={step.description}
          actions={
            <div className="actions">
              <button type="button" className="secondary-button" onClick={onValidate}>
                Validate
              </button>
              {isReviewStep ? (
                <button type="button" className="primary-button" onClick={onGenerate} disabled={generating}>
                  {generating ? "Generating..." : "Generate Output"}
                </button>
              ) : null}
            </div>
          }
        >
          <StepComponent config={config} onChange={onConfigChange} />
        </StepLayout>

        <ValidationPanel title="Validation Errors" messages={validation?.errors ?? []} tone="error" />
        <ValidationPanel title="Validation Warnings" messages={validation?.warnings ?? []} tone="warning" />

        <div className="footer-nav">
          <button type="button" className="ghost-button" onClick={onBack} disabled={activeStep === 0}>
            Back
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={onNext}
            disabled={activeStep === stepMeta.length - 1}
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}
