import type { RecipesEnum } from "../../enums/recipes.enum";
import type { GameItemResource } from "./gameItems/resource.type";

export type SelectedFactoryLineData = {
  selectedItem?: GameItemResource;
  selectedRecipeName?: RecipesEnum;
  itemPerMinute?: number;
};
