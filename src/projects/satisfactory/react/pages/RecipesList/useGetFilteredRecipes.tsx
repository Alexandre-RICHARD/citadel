import { stringSearcher } from "@nexus/nexusExporter";

import { TranslationsFilesEnum as TF } from "../../../enums/translationsFile.enum";
import type { RecipeType } from "../../../types/satisfactory/recipe.type";
import { useCustomTranslations } from "../../hooks/useCustomTranslations";

type PropsType = {
  recipes: RecipeType[];
  searchString: string;
};

export const useGetFilteredRecipes = ({ recipes, searchString }: PropsType) => {
  const t = useCustomTranslations();

  return recipes.filter((recipe) =>
    stringSearcher({
      searchString,
      value: `${recipe.recipeName} ${t(TF.SATISFACTORY_RECIPES, recipe.recipeName)}`,
    }),
  );
};
