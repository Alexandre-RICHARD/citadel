import type { GameClassNamesEnum } from "../../../enums/gameClassNames.enum";
import type { GameItemsEnum } from "../../../enums/gameItems.enum";
import type { GameItemsCategoryEnum } from "../../../enums/gameItemsCategory.enum";
import type { GameResourcesTypeEnum } from "../../../enums/gameResourcesType.enum";

export type GameItemResource = {
  className: GameClassNamesEnum;
  name: GameItemsEnum;
  category: GameItemsCategoryEnum.Resource | GameItemsCategoryEnum.Equipment;
  resourceType: GameResourcesTypeEnum;
  isRawResource: boolean;
};
