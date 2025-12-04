import { roundNumber } from "@nexus/nexusExporter";

import { recipes } from "../dictionnaries/recipes.dictionnary";
import type { FactoryLine } from "../types/satisfactory/factoryLine.type";
import type { SelectedFactoryLineData } from "../types/satisfactory/selectedFactoryLineData.type";
import { itemPerMinute } from "./itemPerMinute.helper";
import { powerCalculation } from "./powerCalculation.helper";

type Args = {
  currentRecipe: SelectedFactoryLineData;
};

export const factoryLineStepCalculator = ({
  currentRecipe,
}: Args): FactoryLine => {
  const recipesInArray = Object.values(recipes);
  const recipe = recipesInArray.find(
    (it) => it.recipeName === currentRecipe?.selectedRecipeName,
  )!;

  const item = recipe.itemsOut.find(
    (it) => it.item === currentRecipe?.selectedItem,
  )!;

  const quantityPerMinute =
    currentRecipe?.itemPerMinute ?? item.quantityPerCycle;
  const initialQuantityPerMinute = itemPerMinute({
    cycleDuration: recipe.initCycleDuration,
    cycleItemCount: item.quantityPerCycle,
  });
  const buildingNumber = Math.ceil(
    quantityPerMinute / initialQuantityPerMinute,
  );
  const overclocking = roundNumber(
    (currentRecipe.itemPerMinute! /
      (buildingNumber * initialQuantityPerMinute)) *
      100,
    2,
    "ceil",
  );

  const { requiredEnergy, requiredPower } = powerCalculation({
    recipe,
    overclocking,
  });

  const isStartingStep = recipe.itemsIn.every(
    (itemIn) => itemIn.item.isRawResource,
  );
  const parents = isStartingStep
    ? []
    : recipe.itemsIn
        .filter((itemIn) => !itemIn.item.isRawResource)
        .map((itemIn) => {
          const itemInRecipe = recipesInArray.find(
            (it) =>
              !it.isAlternate &&
              it.itemsOut.some((itemOut) => itemOut.item === itemIn.item),
          );
          return factoryLineStepCalculator({
            currentRecipe: {
              itemPerMinute:
                (itemIn.quantityPerCycle * quantityPerMinute) /
                item.quantityPerCycle,
              selectedItem: itemIn.item,
              selectedRecipeName: itemInRecipe?.recipeName,
            },
          });
        });

  const rawResources = isStartingStep
    ? recipe.itemsIn.map((itemIn) => ({
        item: itemIn.item,
        quantityPerMinute:
          (itemIn.quantityPerCycle * quantityPerMinute) / item.quantityPerCycle,
      }))
    : [];

  return {
    recipe,
    id: crypto.randomUUID(),
    quantityPerMinute,
    buildingNumber,
    overclocking,
    powerRequired: requiredPower * buildingNumber,
    energyRequired: requiredEnergy,
    isStartingStep,
    parents,
    rawResources,
  };
};
