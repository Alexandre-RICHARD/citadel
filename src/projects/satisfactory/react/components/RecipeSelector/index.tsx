import { getSortStringValue, Selector } from "@nexus/nexusExporter";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { gameItemsDictionnary } from "../../../dictionnaries/gameItems.dictionary";
import { recipes } from "../../../dictionnaries/recipes.dictionnary";
import { GameItemsEnum } from "../../../enums/gameItems.enum";
import { TranslationsFilesEnum as TF } from "../../../enums/translationsFile.enum";
import { useCombinedStore } from "../../../store/combined.store";
import type { GameItemResource } from "../../../types/satisfactory/gameItems/resource.type";
import { useCustomTranslations } from "../../hooks/useCustomTranslations";
import styles from "./styles.module.scss";

export const RecipeSelector = (): React.JSX.Element => {
  const t = useCustomTranslations();
  const recipesInArray = Object.values(recipes);
  const [selectedFactoryLineData, setSelectedFactoryLineData] =
    useCombinedStore(
      useShallow((state) => [
        state.selectedFactoryLineData,
        state.setSelectedFactoryLineData,
      ]),
    );

  const ItemsThatCanBeCrafted = Object.values(GameItemsEnum)
    .filter((item) => {
      return recipesInArray.some((recipe) =>
        recipe.itemsOut.some((itemOut) => itemOut.item.name === item),
      );
    })
    .sort((a, b) =>
      getSortStringValue(
        t(TF.SATISFACTORY_ITEMS, a),
        t(TF.SATISFACTORY_ITEMS, b),
      ),
    );

  const recipeThatCanBeDoWithItemInOutput = recipesInArray.filter((recipe) =>
    recipe.itemsOut.some(
      (itemOut) => itemOut.item === selectedFactoryLineData?.selectedItem,
    ),
  );

  return (
    <div className={styles.recipe_calculator_container}>
      <Selector
        id="satisfactory-calculator-resources-selector"
        position="bottom-right"
        label={
          selectedFactoryLineData?.selectedItem
            ? t(
                TF.SATISFACTORY_ITEMS,
                selectedFactoryLineData?.selectedItem.name,
              )
            : "Selectionnes ta ressource"
        }
        selectedItem={selectedFactoryLineData?.selectedItem?.name}
        items={ItemsThatCanBeCrafted.map((item) => ({
          label: t(TF.SATISFACTORY_ITEMS, item),
          search: t(TF.SATISFACTORY_ITEMS, item),
          value: item,
        }))}
        onSelect={(newValue) => {
          setSelectedFactoryLineData({
            selectedItem: gameItemsDictionnary[newValue] as GameItemResource,
          });
        }}
        search={{
          isHandlingCustomSearch: false,
          strictMode: false,
        }}
      />
      {selectedFactoryLineData?.selectedItem ? (
        <Selector
          id="satisfactory-calculator-recipe-selector"
          position="bottom-right"
          label={
            selectedFactoryLineData?.selectedRecipeName
              ? t(
                  TF.SATISFACTORY_RECIPES,
                  selectedFactoryLineData?.selectedRecipeName,
                )
              : "Selectionnes la recette"
          }
          selectedItem={
            selectedFactoryLineData?.selectedRecipeName ?? undefined
          }
          items={recipeThatCanBeDoWithItemInOutput.map((recipe) => ({
            label: t(TF.SATISFACTORY_RECIPES, recipe.recipeName),
            search: t(TF.SATISFACTORY_RECIPES, recipe.recipeName),
            value: recipe.recipeName,
          }))}
          onSelect={(newValue) =>
            setSelectedFactoryLineData({
              selectedItem: selectedFactoryLineData.selectedItem,
              selectedRecipeName: newValue,
              itemPerMinute: 10,
            })
          }
        />
      ) : null}
      {selectedFactoryLineData?.selectedRecipeName ? (
        <input
          id="item_minute_input"
          className={styles.item_minute_input}
          type="number"
          min={0}
          value={selectedFactoryLineData?.itemPerMinute ?? 0}
          onChange={(event) =>
            setSelectedFactoryLineData({
              ...selectedFactoryLineData,
              itemPerMinute: parseFloat(event.currentTarget.value || "0"),
            })
          }
        />
      ) : null}
    </div>
  );
};
