import type { EndpointEnum } from "../../../enums/endpoint.enum";
import type { GameBuildingsTypeEnum } from "../../../enums/gameBuildingsType.enum";
import type { GameClassNamesEnum } from "../../../enums/gameClassNames.enum";
import type { GameItemsEnum } from "../../../enums/gameItems.enum";
import type { GameItemsCategoryEnum } from "../../../enums/gameItemsCategory.enum";

export type GameItemManufacturerBuilding = {
  className: GameClassNamesEnum;
  name: GameItemsEnum;
  category: GameItemsCategoryEnum.Building;
  buildingType: GameBuildingsTypeEnum.Manufacturer;
  defaultPowerConsumption: number;
  endpoint: EndpointEnum | undefined;
};
