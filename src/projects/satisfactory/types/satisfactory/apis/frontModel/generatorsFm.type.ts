import type { GameClassNamesEnum } from "../../../../enums/gameClassNames.enum";

export type GeneratorFm = {
  id: string;
  name: string;
  className: GameClassNamesEnum;
  overclocking: number;
  isAtFullSpeed: boolean;
  powerProduction: number;
  location: {
    x: number;
    y: number;
  };
};
