import { useCallback, useEffect } from "react";

import { factoryLineDataCalculator } from "../../../helpers/factoryLineDataCalculator.helper";
import { factoryLineStepCalculator } from "../../../helpers/factoryLineStepCalculator.helper";
import type { FactoryLine } from "../../../types/satisfactory/factoryLine.type";
import type { FactoryLineData } from "../../../types/satisfactory/factoryLineData.type";
import type { SelectedFactoryLineData } from "../../../types/satisfactory/selectedFactoryLineData.type";

type PropsType = {
  selectedFactoryLineData?: SelectedFactoryLineData;
  setFactoryLine: (newValue: FactoryLine) => void;
  setFactoryLineData: (newValue: FactoryLineData) => void;
};

export const useCalculateFactoryLine = ({
  selectedFactoryLineData,
  setFactoryLine,
  setFactoryLineData,
}: PropsType) => {
  const getFactoryLine = useCallback(() => {
    if (!selectedFactoryLineData) return null;
    return factoryLineStepCalculator({
      currentRecipe: selectedFactoryLineData,
    });
  }, [selectedFactoryLineData]);

  useEffect(() => {
    const factoryLine = getFactoryLine();
    if (factoryLine) {
      setFactoryLine(factoryLine);
      setFactoryLineData(factoryLineDataCalculator(factoryLine));
    }
  }, [getFactoryLine, setFactoryLine, setFactoryLineData]);
};
