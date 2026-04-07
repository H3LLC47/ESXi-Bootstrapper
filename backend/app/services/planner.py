from app.models.design import DesignConfig
from app.models.responses import PlanStep


def build_deployment_plan(config: DesignConfig) -> list[PlanStep]:
    host_list = ", ".join(host.name for host in config.hosts)
    guest_names = ", ".join(portgroup.name for portgroup in config.networking.guest_portgroups)

    return [
        PlanStep(
            title="Create datacenter and cluster",
            detail=f"Create datacenter '{config.datacenter.name}' and cluster '{config.cluster.name}' in vCenter '{config.vcenter.server}'.",
        ),
        PlanStep(
            title="Create distributed switch",
            detail=(
                f"Create distributed switch '{config.distributed_switch.name}' with MTU {config.distributed_switch.mtu} "
                f"and uplinks {', '.join(config.distributed_switch.uplinks)}."
            ),
        ),
        PlanStep(
            title="Create dedicated VMkernel port groups",
            detail=(
                "Create separate port groups for management, vMotion, storage A, and storage B, "
                "ensuring each VMkernel role maps only to its own port group."
            ),
        ),
        PlanStep(
            title="Create guest VM port groups",
            detail=f"Create VLAN-backed guest port groups: {guest_names}.",
        ),
        PlanStep(
            title="Add ESXi hosts to cluster",
            detail=f"Add hosts {host_list} to cluster '{config.cluster.name}'.",
        ),
        PlanStep(
            title="Attach hosts and map uplinks",
            detail="Add host physical NICs to the distributed switch and apply the declared vmnic-to-uplink mappings.",
        ),
        PlanStep(
            title="Create VMkernel adapters",
            detail="Create management, vMotion, storage A, and storage B VMkernel adapters per host on their dedicated port groups.",
        ),
        PlanStep(
            title="Validate network isolation",
            detail="Confirm storage uplinks are isolated from guest VM traffic and that all VLAN IDs remain unique.",
        ),
    ]

