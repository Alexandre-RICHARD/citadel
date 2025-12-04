import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { CombinedStoreType } from "../types/store/combinedStore.type";
import { useCalculatorStore } from "./storeSlices/calculator.store";
import { useTranslationStore } from "./storeSlices/translation.store";

export const useCombinedStore = create<CombinedStoreType>()(
  devtools(
    (...a) => ({
      ...useCalculatorStore(...a),
      ...useTranslationStore(...a),
    }),
    { name: "Satisfactory" },
  ),
);

const useStore = {
  getInitialState: useCombinedStore.getInitialState,
  getState: useCombinedStore.getState,
  setState: (newState: Partial<CombinedStoreType>) =>
    useCombinedStore.setState(newState),
  subscribe: useCombinedStore.subscribe,
};

export const { getInitialState, getState, setState, subscribe } = useStore;
