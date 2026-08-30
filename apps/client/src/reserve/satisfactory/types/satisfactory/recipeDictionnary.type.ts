import type { RecipesEnum } from "../../enums/recipes.enum";
import type { RecipeType } from "./recipe.type";

export type RecipeDictionnaryType = Record<RecipesEnum, RecipeType>;
