import React from "react";

import { useCombinedStore } from "../../../store/combined.store";
import { GraphContainer } from "../../components/GraphContainer";
import { RecipeSelector } from "../../components/RecipeSelector";
import styles from "./styles.module.scss";

export const FactoryLineCalculator = (): React.JSX.Element => {
  const selectedFactoryLineData = useCombinedStore(
    (state) => state.selectedFactoryLineData,
  );

  return (
    <div className={styles.recipes_calculator}>
      <RecipeSelector />
      {selectedFactoryLineData?.selectedRecipeName && <GraphContainer />}
    </div>
  );
};
