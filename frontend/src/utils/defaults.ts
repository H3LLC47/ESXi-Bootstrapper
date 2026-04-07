import type { DesignConfig, GuestPortgroup, Host } from "../types/design";

export const createDefaultGuestPortgroup = (): GuestPortgroup => ({
  name: "DVPG-GUEST-PROD",
  vlanId: 210,
  activeUplinks: ["Uplink3", "Uplink4"]
});

export const createDefaultHost = (): Host => ({
  name: "esx01.lab.local",
  address: "10.10.10.21",
  physicalNics: ["vmnic0", "vmnic1", "vmnic2", "vmnic3"],
  uplinkMapping: {
    vmnic0: "Uplink1",
    vmnic1: "Uplink2",
    vmnic2: "Uplink3",
    vmnic3: "Uplink4"
  },
  vmkernelAdapters: {
    management: {
      portgroupKey: "management",
      ip: "10.10.110.21",
      subnetMask: "255.255.255.0",
      gateway: "10.10.110.1"
    },
    vmotion: {
      portgroupKey: "vmotion",
      ip: "10.10.120.21",
      subnetMask: "255.255.255.0"
    },
    storageA: {
      portgroupKey: "storageA",
      ip: "10.10.310.21",
      subnetMask: "255.255.255.0"
    },
    storageB: {
      portgroupKey: "storageB",
      ip: "10.10.311.21",
      subnetMask: "255.255.255.0"
    }
  }
});

export const defaultDesign: DesignConfig = {
  metadata: {
    schemaVersion: "1.0.0",
    designName: "primary-cluster-build"
  },
  vcenter: {
    server: "vcsa01.lab.local"
  },
  datacenter: {
    name: "DC01"
  },
  cluster: {
    name: "Compute-Cluster-01",
    haEnabled: true,
    drsEnabled: true
  },
  distributedSwitch: {
    name: "DSwitch-01",
    version: "8.0.0",
    mtu: 9000,
    uplinks: ["Uplink1", "Uplink2", "Uplink3", "Uplink4"]
  },
  networking: {
    vmkernelPortgroups: {
      management: {
        portgroupName: "DVPG-MGMT",
        vlanId: 110,
        activeUplinks: ["Uplink1", "Uplink2"]
      },
      vmotion: {
        portgroupName: "DVPG-VMOTION",
        vlanId: 120,
        activeUplinks: ["Uplink1", "Uplink2"]
      },
      storageA: {
        portgroupName: "DVPG-STORAGE-A",
        vlanId: 310,
        preferredUplink: "Uplink1",
        secondaryUplink: "Uplink2"
      },
      storageB: {
        portgroupName: "DVPG-STORAGE-B",
        vlanId: 311,
        preferredUplink: "Uplink3",
        secondaryUplink: "Uplink4"
      }
    },
    guestPortgroups: [createDefaultGuestPortgroup()],
    storagePolicy: {
      allowSharedPreferredUplink: false
    }
  },
  hosts: [createDefaultHost()]
};

