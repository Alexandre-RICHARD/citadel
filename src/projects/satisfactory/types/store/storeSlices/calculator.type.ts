import type { FactoryLine } from "../../satisfactory/factoryLine.type";
import type { FactoryLineData } from "../../satisfactory/factoryLineData.type";
import type { SelectedFactoryLineData } from "../../satisfactory/selectedFactoryLineData.type";

export type CalculatorSliceType = {
  minuteCalculation: boolean;
  setMinuteCalculation: (newValue: boolean) => void;
  overclocking: number;
  setOverclocking: (newValue: number) => void;
  nameFilter: string;
  setNameFilter: (newValue: string) => void;
  selectedFactoryLineData?: SelectedFactoryLineData;
  setSelectedFactoryLineData: (newValue?: SelectedFactoryLineData) => void;
  factoryLine: FactoryLine | null;
  setFactoryLine: (newValue?: FactoryLine) => void;
  factoryLineData: FactoryLineData | null;
  setFactoryLineData: (newValue?: FactoryLineData) => void;
};
