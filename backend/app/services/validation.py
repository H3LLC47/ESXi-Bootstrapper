from __future__ import annotations

from pydantic import ValidationError

from app.models.design import DesignConfig
from app.models.responses import ValidationMessage, ValidationResponse


def _message(severity: str, path: str, message: str) -> ValidationMessage:
    return ValidationMessage(severity=severity, path=path, message=message)


def validate_design(payload: dict) -> ValidationResponse:
    errors: list[ValidationMessage] = []
    warnings: list[ValidationMessage] = []

    try:
        config = DesignConfig.model_validate(payload)
    except ValidationError as exc:
        for item in exc.errors():
            location = ".".join(str(part) for part in item["loc"])
            errors.append(_message("error", location, item["msg"]))
        return ValidationResponse(valid=False, errors=errors, warnings=warnings, normalized_config=None)

    d_switch_uplinks = set(config.distributed_switch.uplinks)
    vmk_portgroups = config.networking.vmkernel_portgroups
    guest_portgroups = config.networking.guest_portgroups

    all_vlans = [
        vmk_portgroups.management.vlan_id,
        vmk_portgroups.vmotion.vlan_id,
        vmk_portgroups.storage_a.vlan_id,
        vmk_portgroups.storage_b.vlan_id,
        *[pg.vlan_id for pg in guest_portgroups],
    ]
    if len(all_vlans) != len(set(all_vlans)):
        errors.append(_message("error", "networking", "VLAN IDs must be unique across management, vMotion, storage, and guest port groups."))

    if vmk_portgroups.storage_a.vlan_id == vmk_portgroups.storage_b.vlan_id:
        errors.append(_message("error", "networking.vmkernelPortgroups.storageB.vlanId", "Storage VLAN A and Storage VLAN B must be different."))

    if (
        vmk_portgroups.storage_a.preferred_uplink == vmk_portgroups.storage_b.preferred_uplink
        and not config.networking.storage_policy.allow_shared_preferred_uplink
    ):
        errors.append(
            _message(
                "error",
                "networking.storagePolicy.allowSharedPreferredUplink",
                "Storage preferred uplinks for A and B must be different unless shared preferred uplinks are explicitly allowed.",
            )
        )

    for path, portgroup in {
        "networking.vmkernelPortgroups.storageA": vmk_portgroups.storage_a,
        "networking.vmkernelPortgroups.storageB": vmk_portgroups.storage_b,
    }.items():
        if portgroup.preferred_uplink == portgroup.secondary_uplink:
            errors.append(
                _message(
                    "error",
                    path,
                    "Preferred and secondary storage uplinks must be different for the same storage network.",
                )
            )

    portgroup_names = [
        vmk_portgroups.management.portgroup_name,
        vmk_portgroups.vmotion.portgroup_name,
        vmk_portgroups.storage_a.portgroup_name,
        vmk_portgroups.storage_b.portgroup_name,
        *[pg.name for pg in guest_portgroups],
    ]
    if len(portgroup_names) != len(set(portgroup_names)):
        errors.append(_message("error", "networking", "Port group names must be unique across the design."))

    storage_uplinks = {
        vmk_portgroups.storage_a.preferred_uplink,
        vmk_portgroups.storage_a.secondary_uplink,
        vmk_portgroups.storage_b.preferred_uplink,
        vmk_portgroups.storage_b.secondary_uplink,
    }

    for path, uplinks in {
        "networking.vmkernelPortgroups.management.activeUplinks": vmk_portgroups.management.active_uplinks,
        "networking.vmkernelPortgroups.vmotion.activeUplinks": vmk_portgroups.vmotion.active_uplinks,
    }.items():
        missing = [uplink for uplink in uplinks if uplink not in d_switch_uplinks]
        if missing:
            errors.append(_message("error", path, f"Unknown distributed switch uplink(s): {', '.join(missing)}"))

    for path, uplink in {
        "networking.vmkernelPortgroups.storageA.preferredUplink": vmk_portgroups.storage_a.preferred_uplink,
        "networking.vmkernelPortgroups.storageA.secondaryUplink": vmk_portgroups.storage_a.secondary_uplink,
        "networking.vmkernelPortgroups.storageB.preferredUplink": vmk_portgroups.storage_b.preferred_uplink,
        "networking.vmkernelPortgroups.storageB.secondaryUplink": vmk_portgroups.storage_b.secondary_uplink,
    }.items():
        if uplink not in d_switch_uplinks:
            errors.append(_message("error", path, f"Unknown distributed switch uplink '{uplink}'."))

    for index, guest_portgroup in enumerate(guest_portgroups):
        path = f"networking.guestPortgroups.{index}.activeUplinks"
        missing = [uplink for uplink in guest_portgroup.active_uplinks if uplink not in d_switch_uplinks]
        if missing:
            errors.append(_message("error", path, f"Unknown distributed switch uplink(s): {', '.join(missing)}"))
        # Storage isolation is an explicit product rule for this MVP.
        overlap = sorted(set(guest_portgroup.active_uplinks) & storage_uplinks)
        if overlap:
            errors.append(
                _message(
                    "error",
                    path,
                    f"Guest traffic cannot use storage uplinks. Overlapping uplink(s): {', '.join(overlap)}",
                )
            )

    for index, host in enumerate(config.hosts):
        host_path = f"hosts.{index}"
        if set(host.uplink_mapping.keys()) != set(host.physical_nics):
            errors.append(
                _message(
                    "error",
                    f"{host_path}.uplinkMapping",
                    "Every host physical NIC must appear exactly once in the uplink mapping.",
                )
            )
        invalid_mappings = {
            nic: uplink
            for nic, uplink in host.uplink_mapping.items()
            if uplink not in d_switch_uplinks
        }
        if invalid_mappings:
            bad_pairs = ", ".join(f"{nic}->{uplink}" for nic, uplink in invalid_mappings.items())
            errors.append(_message("error", f"{host_path}.uplinkMapping", f"Invalid uplink mapping(s): {bad_pairs}"))

        vmk_assignments = {
            "management": host.vmkernel_adapters.management.portgroup_key,
            "vmotion": host.vmkernel_adapters.vmotion.portgroup_key,
            "storageA": host.vmkernel_adapters.storage_a.portgroup_key,
            "storageB": host.vmkernel_adapters.storage_b.portgroup_key,
        }
        # Each VMkernel role must live on its own dedicated port group and nowhere else.
        for role, assigned_key in vmk_assignments.items():
            if role != assigned_key:
                errors.append(
                    _message(
                        "error",
                        f"{host_path}.vmkernelAdapters.{role}.portgroupKey",
                        f"{role} VMkernel must be attached only to the matching dedicated port group.",
                    )
                )

    if vmk_portgroups.management.portgroup_name == vmk_portgroups.vmotion.portgroup_name:
        errors.append(_message("error", "networking.vmkernelPortgroups", "Management and vMotion must use separate port groups."))

    if not errors and config.distributed_switch.mtu < 9000:
        warnings.append(_message("warning", "distributedSwitch.mtu", "MTU is below 9000. Confirm this is intentional for your storage and vMotion design."))

    return ValidationResponse(
        valid=not errors,
        errors=errors,
        warnings=warnings,
        normalized_config=config.model_dump(by_alias=True),
    )
