from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, IPvAnyAddress, field_validator


class Metadata(BaseModel):
    schema_version: str = Field(alias="schemaVersion")
    design_name: str = Field(alias="designName", min_length=1)

    model_config = ConfigDict(populate_by_name=True)


class VCenter(BaseModel):
    server: str = Field(min_length=1)


class Datacenter(BaseModel):
    name: str = Field(min_length=1)


class Cluster(BaseModel):
    name: str = Field(min_length=1)
    ha_enabled: bool = Field(alias="haEnabled")
    drs_enabled: bool = Field(alias="drsEnabled")

    model_config = ConfigDict(populate_by_name=True)


class DistributedSwitch(BaseModel):
    name: str = Field(min_length=1)
    version: str = "8.0.0"
    mtu: int = Field(ge=1500, le=9000)
    uplinks: list[str] = Field(min_length=2)

    @field_validator("uplinks")
    @classmethod
    def validate_uplinks(cls, value: list[str]) -> list[str]:
        normalized = [item.strip() for item in value if item.strip()]
        if len(normalized) != len(set(normalized)):
            raise ValueError("Distributed switch uplinks must be unique.")
        return normalized


class TrafficPortgroup(BaseModel):
    portgroup_name: str = Field(alias="portgroupName", min_length=1)
    vlan_id: int = Field(alias="vlanId", ge=1, le=4094)
    active_uplinks: list[str] = Field(alias="activeUplinks", min_length=1)

    model_config = ConfigDict(populate_by_name=True)


class StoragePortgroup(BaseModel):
    portgroup_name: str = Field(alias="portgroupName", min_length=1)
    vlan_id: int = Field(alias="vlanId", ge=1, le=4094)
    preferred_uplink: str = Field(alias="preferredUplink", min_length=1)
    secondary_uplink: str = Field(alias="secondaryUplink", min_length=1)

    model_config = ConfigDict(populate_by_name=True)


class VMKernelPortgroups(BaseModel):
    management: TrafficPortgroup
    vmotion: TrafficPortgroup
    storage_a: StoragePortgroup = Field(alias="storageA")
    storage_b: StoragePortgroup = Field(alias="storageB")

    model_config = ConfigDict(populate_by_name=True)


class GuestPortgroup(BaseModel):
    name: str = Field(min_length=1)
    vlan_id: int = Field(alias="vlanId", ge=1, le=4094)
    active_uplinks: list[str] = Field(alias="activeUplinks", min_length=1)

    model_config = ConfigDict(populate_by_name=True)


class StoragePolicy(BaseModel):
    allow_shared_preferred_uplink: bool = Field(alias="allowSharedPreferredUplink", default=False)

    model_config = ConfigDict(populate_by_name=True)


class Networking(BaseModel):
    vmkernel_portgroups: VMKernelPortgroups = Field(alias="vmkernelPortgroups")
    guest_portgroups: list[GuestPortgroup] = Field(alias="guestPortgroups", min_length=1)
    storage_policy: StoragePolicy = Field(alias="storagePolicy")

    model_config = ConfigDict(populate_by_name=True)


class VMKernelAddress(BaseModel):
    portgroup_key: Literal["management", "vmotion", "storageA", "storageB"] = Field(alias="portgroupKey")
    ip: IPvAnyAddress
    subnet_mask: str = Field(alias="subnetMask", min_length=1)

    model_config = ConfigDict(populate_by_name=True)


class ManagementVMKernelAddress(VMKernelAddress):
    gateway: IPvAnyAddress


class HostVMKernelAdapters(BaseModel):
    management: ManagementVMKernelAddress
    vmotion: VMKernelAddress
    storage_a: VMKernelAddress = Field(alias="storageA")
    storage_b: VMKernelAddress = Field(alias="storageB")

    model_config = ConfigDict(populate_by_name=True)


class Host(BaseModel):
    name: str = Field(min_length=1)
    address: str = Field(min_length=1)
    physical_nics: list[str] = Field(alias="physicalNics", min_length=2)
    uplink_mapping: dict[str, str] = Field(alias="uplinkMapping", min_length=1)
    vmkernel_adapters: HostVMKernelAdapters = Field(alias="vmkernelAdapters")

    model_config = ConfigDict(populate_by_name=True)

    @field_validator("physical_nics")
    @classmethod
    def validate_physical_nics(cls, value: list[str]) -> list[str]:
        normalized = [item.strip() for item in value if item.strip()]
        if len(normalized) != len(set(normalized)):
            raise ValueError("Host physical NICs must be unique.")
        return normalized


class DesignConfig(BaseModel):
    metadata: Metadata
    vcenter: VCenter
    datacenter: Datacenter
    cluster: Cluster
    distributed_switch: DistributedSwitch = Field(alias="distributedSwitch")
    networking: Networking
    hosts: list[Host] = Field(min_length=1)

    model_config = ConfigDict(populate_by_name=True)

