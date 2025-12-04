import type { StateCreator } from "zustand";

import type { CalculatorSliceType } from "../../types/store/storeSlices/calculator.type";

export const useCalculatorStore: StateCreator<CalculatorSliceType> = (set) => ({
  minuteCalculation: false,
  setMinuteCalculation: (newValue) => {
    set(() => ({ minuteCalculation: newValue }));
  },
  overclocking: 100,
  setOverclocking: (newValue) => {
    set(() => ({ overclocking: newValue }));
  },
  nameFilter: "",
  setNameFilter: (newValue: string) => {
    set(() => ({ nameFilter: newValue }));
  },
  selectedFactoryLineData: undefined,
  setSelectedFactoryLineData: (newValue) => {
    set(() => ({ selectedFactoryLineData: newValue }));
  },
  factoryLine: null,
  setFactoryLine: (newValue) => set(() => ({ factoryLine: newValue })),
  factoryLineData: null,
  setFactoryLineData: (newValue) => set(() => ({ factoryLineData: newValue })),
});
