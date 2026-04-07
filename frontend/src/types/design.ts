export type Severity = "error" | "warning";

export interface ValidationMessage {
  severity: Severity;
  path: string;
  message: string;
}

export interface Metadata {
  schemaVersion: string;
  designName: string;
}

export interface VCenter {
  server: string;
}

export interface Datacenter {
  name: string;
}

export interface Cluster {
  name: string;
  haEnabled: boolean;
  drsEnabled: boolean;
}

export interface DistributedSwitch {
  name: string;
  version: string;
  mtu: number;
  uplinks: string[];
}

export interface TrafficPortgroup {
  portgroupName: string;
  vlanId: number;
  activeUplinks: string[];
}

export interface StoragePortgroup {
  portgroupName: string;
  vlanId: number;
  preferredUplink: string;
  secondaryUplink: string;
}

export interface GuestPortgroup {
  name: string;
  vlanId: number;
  activeUplinks: string[];
}

export interface Networking {
  vmkernelPortgroups: {
    management: TrafficPortgroup;
    vmotion: TrafficPortgroup;
    storageA: StoragePortgroup;
    storageB: StoragePortgroup;
  };
  guestPortgroups: GuestPortgroup[];
  storagePolicy: {
    allowSharedPreferredUplink: boolean;
  };
}

export interface VMKernelAddress {
  portgroupKey: "management" | "vmotion" | "storageA" | "storageB";
  ip: string;
  subnetMask: string;
}

export interface ManagementVMKernelAddress extends VMKernelAddress {
  gateway: string;
}

export interface Host {
  name: string;
  address: string;
  physicalNics: string[];
  uplinkMapping: Record<string, string>;
  vmkernelAdapters: {
    management: ManagementVMKernelAddress;
    vmotion: VMKernelAddress;
    storageA: VMKernelAddress;
    storageB: VMKernelAddress;
  };
}

export interface DesignConfig {
  metadata: Metadata;
  vcenter: VCenter;
  datacenter: Datacenter;
  cluster: Cluster;
  distributedSwitch: DistributedSwitch;
  networking: Networking;
  hosts: Host[];
}

export interface PlanStep {
  title: string;
  detail: string;
}

export interface ValidationResponse {
  valid: boolean;
  errors: ValidationMessage[];
  warnings: ValidationMessage[];
  normalized_config?: DesignConfig | null;
}

export interface GenerationResponse extends ValidationResponse {
  deployment_plan: PlanStep[];
  powercli_script: string;
}

