import type { DesignConfig, GuestPortgroup } from "../types/design";
import { createDefaultGuestPortgroup } from "../utils/defaults";
import { formatCsv, parseCsv } from "../utils/normalizers";

interface GuestNetworksStepProps {
  config: DesignConfig;
  onChange: (next: DesignConfig) => void;
}

export function GuestNetworksStep({ config, onChange }: GuestNetworksStepProps) {
  const updateGuestPortgroup = (index: number, nextPortgroup: GuestPortgroup) => {
    const nextGuestPortgroups = config.networking.guestPortgroups.map((portgroup, currentIndex) =>
      currentIndex === index ? nextPortgroup : portgroup
    );

    onChange({
      ...config,
      networking: {
        ...config.networking,
        guestPortgroups: nextGuestPortgroups
      }
    });
  };

  const addGuestPortgroup = () =>
    onChange({
      ...config,
      networking: {
        ...config.networking,
        guestPortgroups: [...config.networking.guestPortgroups, createDefaultGuestPortgroup()]
      }
    });

  const removeGuestPortgroup = (index: number) =>
    onChange({
      ...config,
      networking: {
        ...config.networking,
        guestPortgroups: config.networking.guestPortgroups.filter((_, currentIndex) => currentIndex !== index)
      }
    });

  return (
    <div className="stack">
      <div className="helper-banner">
        Guest VM networks are VLAN-backed distributed port groups only. They do not carry Management, vMotion, or Storage VMkernel adapters.
      </div>
      {config.networking.guestPortgroups.map((portgroup, index) => (
        <section className="sub-panel" key={`${portgroup.name}-${index}`}>
          <header className="sub-panel-header">
            <h3>Guest Port Group {index + 1}</h3>
            {config.networking.guestPortgroups.length > 1 ? (
              <button type="button" className="ghost-button" onClick={() => removeGuestPortgroup(index)}>
                Remove
              </button>
            ) : null}
          </header>
          <div className="grid two-column">
            <label>
              <span>Name</span>
              <input
                value={portgroup.name}
                onChange={(event) => updateGuestPortgroup(index, { ...portgroup, name: event.target.value })}
              />
            </label>
            <label>
              <span>VLAN ID</span>
              <input
                type="number"
                value={portgroup.vlanId}
                onChange={(event) =>
                  updateGuestPortgroup(index, { ...portgroup, vlanId: Number(event.target.value) })
                }
              />
            </label>
            <label className="full-width">
              <span>Active uplinks</span>
              <input
                value={formatCsv(portgroup.activeUplinks)}
                onChange={(event) =>
                  updateGuestPortgroup(index, {
                    ...portgroup,
                    activeUplinks: parseCsv(event.target.value)
                  })
                }
              />
            </label>
          </div>
        </section>
      ))}
      <button type="button" className="secondary-button" onClick={addGuestPortgroup}>
        Add guest port group
      </button>
    </div>
  );
}

