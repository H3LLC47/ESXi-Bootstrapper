import type { DesignConfig, StoragePortgroup } from "../types/design";

interface StorageStepProps {
  config: DesignConfig;
  onChange: (next: DesignConfig) => void;
}

function StorageCard({
  title,
  value,
  onChange
}: {
  title: string;
  value: StoragePortgroup;
  onChange: (next: StoragePortgroup) => void;
}) {
  return (
    <section className="sub-panel">
      <h3>{title}</h3>
      <p>This storage port group is dedicated to one storage VMkernel network and cannot be shared with guest traffic.</p>
      <div className="grid two-column">
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
        <label>
          <span>Preferred uplink</span>
          <input
            value={value.preferredUplink}
            onChange={(event) => onChange({ ...value, preferredUplink: event.target.value })}
          />
        </label>
        <label>
          <span>Secondary uplink</span>
          <input
            value={value.secondaryUplink}
            onChange={(event) => onChange({ ...value, secondaryUplink: event.target.value })}
          />
        </label>
      </div>
    </section>
  );
}

export function StorageStep({ config, onChange }: StorageStepProps) {
  const vmk = config.networking.vmkernelPortgroups;

  return (
    <div className="stack">
      <StorageCard
        title="Storage A"
        value={vmk.storageA}
        onChange={(storageA) =>
          onChange({
            ...config,
            networking: {
              ...config.networking,
              vmkernelPortgroups: { ...vmk, storageA }
            }
          })
        }
      />
      <StorageCard
        title="Storage B"
        value={vmk.storageB}
        onChange={(storageB) =>
          onChange({
            ...config,
            networking: {
              ...config.networking,
              vmkernelPortgroups: { ...vmk, storageB }
            }
          })
        }
      />
      <label className="checkbox">
        <input
          type="checkbox"
          checked={config.networking.storagePolicy.allowSharedPreferredUplink}
          onChange={(event) =>
            onChange({
              ...config,
              networking: {
                ...config.networking,
                storagePolicy: {
                  allowSharedPreferredUplink: event.target.checked
                }
              }
            })
          }
        />
        <span>Allow shared preferred uplink between Storage A and Storage B</span>
      </label>
    </div>
  );
}

