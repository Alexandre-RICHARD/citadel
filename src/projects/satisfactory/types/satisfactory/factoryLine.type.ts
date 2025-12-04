import type { InitialRawResource } from "./initialRawResource.type";
import type { RecipeType } from "./recipe.type";

export type FactoryLine = {
  id: string;
  recipe: RecipeType;
  quantityPerMinute: number;
  buildingNumber: number;
  overclocking: number;
  powerRequired: number;
  energyRequired: number;
  isStartingStep: boolean;
  parents: FactoryLine[];
  rawResources?: InitialRawResource[];
};
