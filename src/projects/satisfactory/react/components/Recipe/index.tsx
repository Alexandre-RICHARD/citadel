import {
  IconContainer,
  IconTokenEnum,
  roundNumber,
} from "@nexus/nexusExporter";
import React from "react";

import { TranslationsFilesEnum as TF } from "../../../enums/translationsFile.enum";
import { powerCalculation } from "../../../helpers/powerCalculation.helper";
import { useCombinedStore } from "../../../store/combined.store";
import type { RecipeType } from "../../../types/satisfactory/recipe.type";
import { useCustomTranslations } from "../../hooks/useCustomTranslations";
import { ResourceBox } from "./resourceBox";
import styles from "./styles.module.scss";

type PropsType = {
  recipe: RecipeType;
};

export const Recipe = ({ recipe }: PropsType): React.JSX.Element => {
  const t = useCustomTranslations();
  const overclocking = useCombinedStore((state) => state.overclocking);

  const { cycleDuration, requiredEnergy, requiredPower } = powerCalculation({
    recipe,
    overclocking,
  });

  return (
    <div
      key={recipe.recipeName}
      className={styles.one_recipe_container}
    >
      <p className={styles.recipe_title}>
        {t(TF.SATISFACTORY_RECIPES, recipe.recipeName)}
        {recipe.isDuplicate && (
          <span className={styles.duplicated_recipe}>Duplicate</span>
        )}
      </p>
      <div className={styles.one_recipe}>
        <div className={styles.resource_group}>
          {recipe.itemsIn.map((resource) => {
            return (
              <ResourceBox
                key={resource.item.name}
                cycleDuration={cycleDuration}
                resource={resource}
              />
            );
          })}
        </div>
        <div className={styles.arrow_container}>
          <IconContainer
            iconToken={IconTokenEnum.TriangleArrow}
            color="#ccc"
            size={14}
          />
        </div>
        <div className={styles.resource_group}>
          {recipe.itemsOut.map((resource) => {
            return (
              <ResourceBox
                key={resource.item.name}
                cycleDuration={cycleDuration}
                resource={resource}
              />
            );
          })}
        </div>
        <div className={styles.recipe_info}>
          <p>
            {t(TF.COMMON, "producedIn")}{" "}
            <span className={styles.recipes_one_info}>
              {t(TF.SATISFACTORY_ITEMS, recipe.craftBuildings.name)}
            </span>
          </p>
          <p>
            {t(TF.COMMON, "cycleDuration")}{" "}
            <span className={styles.recipes_one_info}>
              {roundNumber(cycleDuration, 1)}s
            </span>
          </p>
          <p>
            {t(TF.COMMON, "requiredPower")}{" "}
            <span className={styles.recipes_one_info}>
              {roundNumber(requiredPower, 2)} Mw
            </span>{" "}
            {t(TF.COMMON, "powerByBuilding")}
          </p>
          <p>
            {t(TF.COMMON, "requiredEnergy")}{" "}
            <span className={styles.recipes_one_info}>
              {roundNumber(requiredEnergy, 2)} Mj
            </span>{" "}
            {t(TF.COMMON, "energyPerItem")}
          </p>
        </div>
      </div>
    </div>
  );
};
