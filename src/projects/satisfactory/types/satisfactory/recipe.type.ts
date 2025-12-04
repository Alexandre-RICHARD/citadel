import type { RecipesEnum } from "../../enums/recipes.enum";
import type { GameItemGeneratorBuilding } from "./gameItems/generatorBuilding.type";
import type { GameItemManufacturerBuilding } from "./gameItems/manufacturerBuilding.type";
import type { ItemsInOutType } from "./itemsInOut.type";

export type RecipeType = {
  recipeName: RecipesEnum;
  craftBuildings: GameItemGeneratorBuilding | GameItemManufacturerBuilding;
  itemsIn: ItemsInOutType[];
  itemsOut: ItemsInOutType[];
  initCycleDuration: number;
  isDuplicate?: true;
  isAlternate?: true;
};
