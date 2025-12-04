import type { GameItemsEnum } from "../enums/gameItems.enum";
import type { FactoryLine } from "../types/satisfactory/factoryLine.type";
import type { FactoryLineData } from "../types/satisfactory/factoryLineData.type";
import type { InitialRawResource } from "../types/satisfactory/initialRawResource.type";

export const factoryLineDataCalculator = (
  factoryLine: FactoryLine,
): FactoryLineData => {
  let totalEnergyRequired = 0;
  let totalPowerRequired = 0;
  const rawResources: Partial<Record<GameItemsEnum, InitialRawResource>> = {};

  const endItemQuantityWanted = factoryLine.quantityPerMinute;

  const getInfo = (step: FactoryLine) => {
    totalEnergyRequired +=
      (step.energyRequired * step.quantityPerMinute) / endItemQuantityWanted;
    totalPowerRequired += step.powerRequired;
    if (step.rawResources) {
      step.rawResources.forEach((rawResource) => {
        const currentRawResource = rawResources[rawResource.item.name];
        if (currentRawResource) {
          rawResources[rawResource.item.name] = {
            ...currentRawResource,
            quantityPerMinute:
              currentRawResource.quantityPerMinute +
              rawResource.quantityPerMinute,
          };
        } else {
          rawResources[rawResource.item.name] = {
            item: rawResource.item,
            quantityPerMinute: rawResource.quantityPerMinute,
          };
        }
      });
    }
    if (step.parents.length) step.parents.forEach((parent) => getInfo(parent));
  };

  getInfo(factoryLine);

  return {
    totalEnergyRequired,
    totalPowerRequired,
    rawResources: Object.values(rawResources),
  };
};
