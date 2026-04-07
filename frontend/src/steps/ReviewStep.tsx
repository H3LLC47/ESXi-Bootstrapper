import type { DesignConfig } from "../types/design";

interface ReviewStepProps {
  config: DesignConfig;
  onChange: (next: DesignConfig) => void;
}

export function ReviewStep({ config }: ReviewStepProps) {
  const vmk = config.networking.vmkernelPortgroups;

  return (
    <div className="stack">
      <section className="sub-panel">
        <h3>Environment</h3>
        <dl className="summary-grid">
          <dt>Design</dt>
          <dd>{config.metadata.designName}</dd>
          <dt>vCenter</dt>
          <dd>{config.vcenter.server}</dd>
          <dt>Datacenter</dt>
          <dd>{config.datacenter.name}</dd>
          <dt>Cluster</dt>
          <dd>{config.cluster.name}</dd>
          <dt>Distributed switch</dt>
          <dd>{config.distributedSwitch.name}</dd>
        </dl>
      </section>

      <section className="sub-panel">
        <h3>Dedicated VMkernel Port Groups</h3>
        <dl className="summary-grid">
          <dt>{vmk.management.portgroupName}</dt>
          <dd>Management VMK only | VLAN {vmk.management.vlanId}</dd>
          <dt>{vmk.vmotion.portgroupName}</dt>
          <dd>vMotion VMK only | VLAN {vmk.vmotion.vlanId}</dd>
          <dt>{vmk.storageA.portgroupName}</dt>
          <dd>Storage A VMK only | VLAN {vmk.storageA.vlanId}</dd>
          <dt>{vmk.storageB.portgroupName}</dt>
          <dd>Storage B VMK only | VLAN {vmk.storageB.vlanId}</dd>
        </dl>
      </section>

      <section className="sub-panel">
        <h3>Guest Port Groups</h3>
        <ul className="summary-list">
          {config.networking.guestPortgroups.map((portgroup) => (
            <li key={portgroup.name}>
              {portgroup.name} | VLAN {portgroup.vlanId} | No VMkernel adapter
            </li>
          ))}
        </ul>
      </section>

      <section className="sub-panel">
        <h3>Hosts</h3>
        <ul className="summary-list">
          {config.hosts.map((host) => (
            <li key={host.name}>
              <strong>{host.name}</strong>
              <span>
                Management VMK -> {host.vmkernelAdapters.management.ip}, vMotion VMK -> {host.vmkernelAdapters.vmotion.ip},
                Storage A VMK -> {host.vmkernelAdapters.storageA.ip}, Storage B VMK -> {host.vmkernelAdapters.storageB.ip}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
