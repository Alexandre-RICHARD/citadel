import type { GameItemResource } from "./gameItems/resource.type";

export type InitialRawResource = {
  item: GameItemResource;
  quantityPerMinute: number;
};
