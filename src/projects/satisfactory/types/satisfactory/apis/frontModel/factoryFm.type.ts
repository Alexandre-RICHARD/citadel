import type { GameClassNamesEnum } from "../../../../enums/gameClassNames.enum";

export type FactoryFm = {
  id: string;
  name: string;
  className: GameClassNamesEnum;
  overclocking: number;
  efficiency: number;
  powerConsumption: number;
  location: {
    x: number;
    y: number;
  };
};
