import { EndpointEnum } from "../enums/endpoint.enum";
import { extractorDtoToFmMapper } from "../mappers/satisfactory/extractorDtoToFm.mapper";
import { factoryDtoToFmMapper } from "../mappers/satisfactory/factoryDtoToFm.mapper";
import { generatorsDtoToFmMapper } from "../mappers/satisfactory/generatorsDtoToFm.mapper";
import { worldInventoryDtoToFmMapper } from "../mappers/satisfactory/worldInventoryDtoToFm.mapper";
import type { EndPoint } from "../types/satisfactory/endpoint.type";

export const endPointDictionnary: EndPoint = {
  [EndpointEnum.EXTRACTOR]: extractorDtoToFmMapper,
  [EndpointEnum.FACTORY]: factoryDtoToFmMapper,
  [EndpointEnum.GENERATOR]: generatorsDtoToFmMapper,
  [EndpointEnum.WORLD_INVENTORY]: worldInventoryDtoToFmMapper,
};
