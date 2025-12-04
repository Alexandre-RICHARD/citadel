import type { GameBuildingsTypeEnum } from "../../../enums/gameBuildingsType.enum";
import type { GameClassNamesEnum } from "../../../enums/gameClassNames.enum";
import type { GameItemsEnum } from "../../../enums/gameItems.enum";
import type { GameItemsCategoryEnum } from "../../../enums/gameItemsCategory.enum";

export type GameItemOtherBuilding = {
  className: GameClassNamesEnum;
  name: GameItemsEnum;
  category: GameItemsCategoryEnum.Building;
  // Exclude references other buildings type file handled
  buildingType: Exclude<
    GameBuildingsTypeEnum,
    | GameBuildingsTypeEnum.Extractor
    | GameBuildingsTypeEnum.Generator
    | GameBuildingsTypeEnum.Manufacturer
  >;
};
