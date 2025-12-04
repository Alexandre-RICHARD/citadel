import type { GameBuildingsTypeEnum } from "../../../enums/gameBuildingsType.enum";
import type { GameClassNamesEnum } from "../../../enums/gameClassNames.enum";
import type { GameItemsEnum } from "../../../enums/gameItems.enum";
import type { GameItemsCategoryEnum } from "../../../enums/gameItemsCategory.enum";

export type GameItemExtractorBuilding = {
  className: GameClassNamesEnum;
  name: GameItemsEnum;
  category: GameItemsCategoryEnum.Building;
  buildingType: GameBuildingsTypeEnum.Extractor;
  defaultPowerConsumption: number;
};
