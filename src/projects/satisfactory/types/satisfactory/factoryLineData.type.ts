import type { InitialRawResource } from "./initialRawResource.type";

export type FactoryLineData = {
  rawResources?: InitialRawResource[];
  totalPowerRequired: number;
  totalEnergyRequired: number;
};
