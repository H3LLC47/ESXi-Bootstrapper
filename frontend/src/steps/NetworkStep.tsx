import type { DesignConfig, TrafficPortgroup } from "../types/design";
import { formatCsv, parseCsv } from "../utils/normalizers";

interface NetworkStepProps {
  config: DesignConfig;
  onChange: (next: DesignConfig) => void;
}

function NetworkCard({
  title,
  note,
  value,
  onChange
}: {
  title: string;
  note: string;
  value: TrafficPortgroup;
  onChange: (next: TrafficPortgroup) => void;
}) {
  return (
    <section className="sub-panel">
      <h3>{title}</h3>
      <p>{note}</p>
      <div className="grid">
        <label>
          <span>Port group name</span>
          <input
            value={value.portgroupName}
            onChange={(event) => onChange({ ...value, portgroupName: event.target.value })}
          />
        </label>
        <label>
          <span>VLAN ID</span>
          <input
            type="number"
            value={value.vlanId}
            onChange={(event) => onChange({ ...value, vlanId: Number(event.target.value) })}
          />
        </label>
        <label className="full-width">
          <span>Active uplinks</span>
          <input
            value={formatCsv(value.activeUplinks)}
            onChange={(event) => onChange({ ...value, activeUplinks: parseCsv(event.target.value) })}
          />
        </label>
      </div>
    </section>
  );
}

export function NetworkStep({ config, onChange }: NetworkStepProps) {
  const vmk = config.networking.vmkernelPortgroups;

  return (
    <div className="stack">
      <NetworkCard
        title="Management VMkernel Port Group"
        note="This dedicated port group carries only the Management VMkernel adapter."
        value={vmk.management}
        onChange={(management) =>
          onChange({
            ...config,
            networking: {
              ...config.networking,
              vmkernelPortgroups: { ...vmk, management }
            }
          })
        }
      />
      <NetworkCard
        title="vMotion VMkernel Port Group"
        note="This dedicated port group carries only the vMotion VMkernel adapter."
        value={vmk.vmotion}
        onChange={(vmotion) =>
          onChange({
            ...config,
            networking: {
              ...config.networking,
              vmkernelPortgroups: { ...vmk, vmotion }
            }
          })
        }
      />
    </div>
  );
}

