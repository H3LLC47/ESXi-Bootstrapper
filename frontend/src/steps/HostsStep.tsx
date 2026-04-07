import type { DesignConfig, Host } from "../types/design";
import { createDefaultHost } from "../utils/defaults";
import { formatCsv, parseCsv } from "../utils/normalizers";

interface HostsStepProps {
  config: DesignConfig;
  onChange: (next: DesignConfig) => void;
}

function buildUplinkMapping(physicalNics: string[], existing: Record<string, string>): Record<string, string> {
  return physicalNics.reduce<Record<string, string>>((accumulator, nic) => {
    accumulator[nic] = existing[nic] ?? "";
    return accumulator;
  }, {});
}

export function HostsStep({ config, onChange }: HostsStepProps) {
  const updateHost = (index: number, nextHost: Host) => {
    const nextHosts = config.hosts.map((host, currentIndex) => (currentIndex === index ? nextHost : host));
    onChange({ ...config, hosts: nextHosts });
  };

  const addHost = () => onChange({ ...config, hosts: [...config.hosts, createDefaultHost()] });

  const removeHost = (index: number) =>
    onChange({ ...config, hosts: config.hosts.filter((_, currentIndex) => currentIndex !== index) });

  return (
    <div className="stack">
      {config.hosts.map((host, index) => (
        <section className="sub-panel" key={`${host.name}-${index}`}>
          <header className="sub-panel-header">
            <h3>Host {index + 1}</h3>
            {config.hosts.length > 1 ? (
              <button type="button" className="ghost-button" onClick={() => removeHost(index)}>
                Remove
              </button>
            ) : null}
          </header>
          <div className="grid two-column">
            <label>
              <span>Host FQDN</span>
              <input
                value={host.name}
                onChange={(event) => updateHost(index, { ...host, name: event.target.value })}
              />
            </label>
            <label>
              <span>ESXi host address</span>
              <input
                value={host.address}
                onChange={(event) => updateHost(index, { ...host, address: event.target.value })}
              />
            </label>
            <label className="full-width">
              <span>Physical NIC inventory</span>
              <input
                value={formatCsv(host.physicalNics)}
                onChange={(event) => {
                  const physicalNics = parseCsv(event.target.value);
                  updateHost(index, {
                    ...host,
                    physicalNics,
                    uplinkMapping: buildUplinkMapping(physicalNics, host.uplinkMapping)
                  });
                }}
              />
            </label>
          </div>

          <section className="mapping-grid">
            <h4>VMNIC to uplink mapping</h4>
            {host.physicalNics.map((nic) => (
              <label key={nic}>
                <span>{nic}</span>
                <input
                  value={host.uplinkMapping[nic] ?? ""}
                  onChange={(event) =>
                    updateHost(index, {
                      ...host,
                      uplinkMapping: {
                        ...host.uplinkMapping,
                        [nic]: event.target.value
                      }
                    })
                  }
                />
              </label>
            ))}
          </section>

          <section className="mapping-grid">
            <h4>Dedicated VMkernel assignments</h4>
            <label>
              <span>Management IP</span>
              <input
                value={host.vmkernelAdapters.management.ip}
                onChange={(event) =>
                  updateHost(index, {
                    ...host,
                    vmkernelAdapters: {
                      ...host.vmkernelAdapters,
                      management: { ...host.vmkernelAdapters.management, ip: event.target.value }
                    }
                  })
                }
              />
            </label>
            <label>
              <span>Management mask</span>
              <input
                value={host.vmkernelAdapters.management.subnetMask}
                onChange={(event) =>
                  updateHost(index, {
                    ...host,
                    vmkernelAdapters: {
                      ...host.vmkernelAdapters,
                      management: {
                        ...host.vmkernelAdapters.management,
                        subnetMask: event.target.value
                      }
                    }
                  })
                }
              />
            </label>
            <label>
              <span>Management gateway</span>
              <input
                value={host.vmkernelAdapters.management.gateway}
                onChange={(event) =>
                  updateHost(index, {
                    ...host,
                    vmkernelAdapters: {
                      ...host.vmkernelAdapters,
                      management: { ...host.vmkernelAdapters.management, gateway: event.target.value }
                    }
                  })
                }
              />
            </label>
            <label>
              <span>vMotion IP</span>
              <input
                value={host.vmkernelAdapters.vmotion.ip}
                onChange={(event) =>
                  updateHost(index, {
                    ...host,
                    vmkernelAdapters: {
                      ...host.vmkernelAdapters,
                      vmotion: { ...host.vmkernelAdapters.vmotion, ip: event.target.value }
                    }
                  })
                }
              />
            </label>
            <label>
              <span>vMotion mask</span>
              <input
                value={host.vmkernelAdapters.vmotion.subnetMask}
                onChange={(event) =>
                  updateHost(index, {
                    ...host,
                    vmkernelAdapters: {
                      ...host.vmkernelAdapters,
                      vmotion: { ...host.vmkernelAdapters.vmotion, subnetMask: event.target.value }
                    }
                  })
                }
              />
            </label>
            <label>
              <span>Storage A IP</span>
              <input
                value={host.vmkernelAdapters.storageA.ip}
                onChange={(event) =>
                  updateHost(index, {
                    ...host,
                    vmkernelAdapters: {
                      ...host.vmkernelAdapters,
                      storageA: { ...host.vmkernelAdapters.storageA, ip: event.target.value }
                    }
                  })
                }
              />
            </label>
            <label>
              <span>Storage A mask</span>
              <input
                value={host.vmkernelAdapters.storageA.subnetMask}
                onChange={(event) =>
                  updateHost(index, {
                    ...host,
                    vmkernelAdapters: {
                      ...host.vmkernelAdapters,
                      storageA: {
                        ...host.vmkernelAdapters.storageA,
                        subnetMask: event.target.value
                      }
                    }
                  })
                }
              />
            </label>
            <label>
              <span>Storage B IP</span>
              <input
                value={host.vmkernelAdapters.storageB.ip}
                onChange={(event) =>
                  updateHost(index, {
                    ...host,
                    vmkernelAdapters: {
                      ...host.vmkernelAdapters,
                      storageB: { ...host.vmkernelAdapters.storageB, ip: event.target.value }
                    }
                  })
                }
              />
            </label>
            <label>
              <span>Storage B mask</span>
              <input
                value={host.vmkernelAdapters.storageB.subnetMask}
                onChange={(event) =>
                  updateHost(index, {
                    ...host,
                    vmkernelAdapters: {
                      ...host.vmkernelAdapters,
                      storageB: {
                        ...host.vmkernelAdapters.storageB,
                        subnetMask: event.target.value
                      }
                    }
                  })
                }
              />
            </label>
          </section>
        </section>
      ))}
      <button type="button" className="secondary-button" onClick={addHost}>
        Add host
      </button>
    </div>
  );
}

