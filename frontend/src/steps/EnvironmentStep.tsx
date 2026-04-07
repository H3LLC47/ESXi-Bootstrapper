import type { DesignConfig } from "../types/design";
import { formatCsv, parseCsv } from "../utils/normalizers";

interface EnvironmentStepProps {
  config: DesignConfig;
  onChange: (next: DesignConfig) => void;
}

export function EnvironmentStep({ config, onChange }: EnvironmentStepProps) {
  const update = <K extends keyof DesignConfig>(section: K, value: DesignConfig[K]) => {
    onChange({ ...config, [section]: value });
  };

  return (
    <div className="grid two-column">
      <label>
        <span>Design name</span>
        <input
          value={config.metadata.designName}
          onChange={(event) =>
            update("metadata", { ...config.metadata, designName: event.target.value })
          }
        />
      </label>
      <label>
        <span>Schema version</span>
        <input
          value={config.metadata.schemaVersion}
          onChange={(event) =>
            update("metadata", { ...config.metadata, schemaVersion: event.target.value })
          }
        />
      </label>
      <label>
        <span>vCenter server</span>
        <input
          value={config.vcenter.server}
          onChange={(event) => update("vcenter", { server: event.target.value })}
        />
      </label>
      <label>
        <span>Datacenter name</span>
        <input
          value={config.datacenter.name}
          onChange={(event) => update("datacenter", { name: event.target.value })}
        />
      </label>
      <label>
        <span>Cluster name</span>
        <input
          value={config.cluster.name}
          onChange={(event) => update("cluster", { ...config.cluster, name: event.target.value })}
        />
      </label>
      <label>
        <span>Distributed switch name</span>
        <input
          value={config.distributedSwitch.name}
          onChange={(event) =>
            update("distributedSwitch", { ...config.distributedSwitch, name: event.target.value })
          }
        />
      </label>
      <label>
        <span>Distributed switch version</span>
        <input
          value={config.distributedSwitch.version}
          onChange={(event) =>
            update("distributedSwitch", {
              ...config.distributedSwitch,
              version: event.target.value
            })
          }
        />
      </label>
      <label>
        <span>MTU</span>
        <input
          type="number"
          value={config.distributedSwitch.mtu}
          onChange={(event) =>
            update("distributedSwitch", {
              ...config.distributedSwitch,
              mtu: Number(event.target.value)
            })
          }
        />
      </label>
      <label className="full-width">
        <span>Distributed switch uplinks</span>
        <input
          value={formatCsv(config.distributedSwitch.uplinks)}
          onChange={(event) =>
            update("distributedSwitch", {
              ...config.distributedSwitch,
              uplinks: parseCsv(event.target.value)
            })
          }
        />
      </label>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={config.cluster.haEnabled}
          onChange={(event) =>
            update("cluster", { ...config.cluster, haEnabled: event.target.checked })
          }
        />
        <span>Enable HA</span>
      </label>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={config.cluster.drsEnabled}
          onChange={(event) =>
            update("cluster", { ...config.cluster, drsEnabled: event.target.checked })
          }
        />
        <span>Enable DRS</span>
      </label>
    </div>
  );
}

