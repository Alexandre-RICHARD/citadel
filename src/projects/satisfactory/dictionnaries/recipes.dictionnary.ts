import { GameItemsEnum } from "../enums/gameItems.enum";
import { RecipesEnum } from "../enums/recipes.enum";
import type { RecipeDictionnaryType } from "../types/satisfactory/recipeDictionnary.type";
import { gameItemsDictionnary } from "./gameItems.dictionary";

export const recipes: RecipeDictionnaryType = {
  // ====== Raw resources items =======
  // Iron_Ore
  [RecipesEnum.Iron_Ore_Limestone]: {
    recipeName: RecipesEnum.Iron_Ore_Limestone,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Limestone],
        quantityPerCycle: 24,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ore],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 6,
  },
  // Copper_Ore
  [RecipesEnum.Copper_Ore_Quartz]: {
    recipeName: RecipesEnum.Copper_Ore_Quartz,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Raw_Quartz],
        quantityPerCycle: 10,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ore],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Copper_Ore_Sulfur]: {
    recipeName: RecipesEnum.Copper_Ore_Sulfur,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfur],
        quantityPerCycle: 12,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ore],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 6,
  },
  // Limestone
  [RecipesEnum.Limestone_Sulfur]: {
    recipeName: RecipesEnum.Limestone_Sulfur,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfur],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Limestone],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 6,
  },
  // Coal
  [RecipesEnum.Alternate_Charcoal]: {
    recipeName: RecipesEnum.Alternate_Charcoal,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Wood],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Coal],
        quantityPerCycle: 10,
      },
    ],
    initCycleDuration: 4,
  },
  [RecipesEnum.Alternate_Biocoal]: {
    recipeName: RecipesEnum.Alternate_Biocoal,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Biomass],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Coal],
        quantityPerCycle: 6,
      },
    ],
    initCycleDuration: 8,
  },
  [RecipesEnum.Coal_Iron]: {
    recipeName: RecipesEnum.Coal_Iron,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ore],
        quantityPerCycle: 18,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Coal],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Coal_Limestone]: {
    recipeName: RecipesEnum.Coal_Limestone,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Limestone],
        quantityPerCycle: 36,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Coal],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 6,
  },
  // Water
  [RecipesEnum.Unpackage_Water]: {
    recipeName: RecipesEnum.Unpackage_Water,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Water],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Canister],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 1,
  },
  // Packaged_Water
  [RecipesEnum.Packaged_Water]: {
    recipeName: RecipesEnum.Packaged_Water,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Canister],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Water],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 2,
  },
  // Crude_Oil
  [RecipesEnum.Unpackage_Oil]: {
    recipeName: RecipesEnum.Unpackage_Oil,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Oil],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Crude_Oil],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Canister],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 2,
  },
  // Packaged_Oil
  [RecipesEnum.Packaged_Oil]: {
    recipeName: RecipesEnum.Packaged_Oil,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Crude_Oil],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Canister],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Oil],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 4,
  },
  // Caterium_Ore
  [RecipesEnum.Caterium_Ore_Copper]: {
    recipeName: RecipesEnum.Caterium_Ore_Copper,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ore],
        quantityPerCycle: 15,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Caterium_Ore],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Caterium_Ore_Quartz]: {
    recipeName: RecipesEnum.Caterium_Ore_Quartz,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Raw_Quartz],
        quantityPerCycle: 12,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Caterium_Ore],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 6,
  },
  // Bauxite
  [RecipesEnum.Bauxite_Caterium]: {
    recipeName: RecipesEnum.Bauxite_Caterium,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Caterium_Ore],
        quantityPerCycle: 15,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Bauxite],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Bauxite_Copper]: {
    recipeName: RecipesEnum.Bauxite_Copper,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ore],
        quantityPerCycle: 18,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Bauxite],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 6,
  },
  // Raw_Quartz
  [RecipesEnum.Raw_Quartz_Bauxite]: {
    recipeName: RecipesEnum.Raw_Quartz_Bauxite,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Bauxite],
        quantityPerCycle: 10,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Raw_Quartz],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Raw_Quartz_Coal]: {
    recipeName: RecipesEnum.Raw_Quartz_Coal,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Coal],
        quantityPerCycle: 24,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Raw_Quartz],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 6,
  },
  // Sulfur
  [RecipesEnum.Sulfur_Coal]: {
    recipeName: RecipesEnum.Sulfur_Coal,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Coal],
        quantityPerCycle: 20,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfur],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Sulfur_Iron]: {
    recipeName: RecipesEnum.Sulfur_Iron,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ore],
        quantityPerCycle: 30,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfur],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 6,
  },
  // Uranium
  [RecipesEnum.Uranium_Ore_Bauxite]: {
    recipeName: RecipesEnum.Uranium_Ore_Bauxite,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Bauxite],
        quantityPerCycle: 48,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Uranium],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 6,
  },
  // Nitrogen_Gas
  [RecipesEnum.Unpackage_Nitrogen_Gas]: {
    recipeName: RecipesEnum.Unpackage_Nitrogen_Gas,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Nitrogen_Gas],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Nitrogen_Gas],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Fluid_Tank],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 1,
  },
  [RecipesEnum.Nitrogen_Gas_Bauxite]: {
    recipeName: RecipesEnum.Nitrogen_Gas_Bauxite,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Bauxite],
        quantityPerCycle: 10,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Nitrogen_Gas],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Nitrogen_Gas_Caterium]: {
    recipeName: RecipesEnum.Nitrogen_Gas_Caterium,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Caterium_Ore],
        quantityPerCycle: 12,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Nitrogen_Gas],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 6,
  },
  // Packaged_Nitrogen_Gas
  [RecipesEnum.Packaged_Nitrogen_Gas]: {
    recipeName: RecipesEnum.Packaged_Nitrogen_Gas,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Nitrogen_Gas],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Fluid_Tank],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Nitrogen_Gas],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 1,
  },

  // ========== Tier 1 items ==========
  // Iron_Ingot
  [RecipesEnum.Iron_Ingot]: {
    recipeName: RecipesEnum.Iron_Ingot,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Smelter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ore],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ingot],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 2,
  },
  [RecipesEnum.Alternate_Basic_Iron_Ingot]: {
    recipeName: RecipesEnum.Alternate_Basic_Iron_Ingot,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Foundry],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ore],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Limestone],
        quantityPerCycle: 8,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ingot],
        quantityPerCycle: 10,
      },
    ],
    initCycleDuration: 12,
  },
  [RecipesEnum.Alternate_Pure_Iron_Ingot]: {
    recipeName: RecipesEnum.Alternate_Pure_Iron_Ingot,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ore],
        quantityPerCycle: 7,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 4,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ingot],
        quantityPerCycle: 13,
      },
    ],
    initCycleDuration: 12,
  },
  [RecipesEnum.Alternate_Iron_Alloy_Ingot]: {
    recipeName: RecipesEnum.Alternate_Iron_Alloy_Ingot,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Foundry],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ore],
        quantityPerCycle: 8,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ore],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ingot],
        quantityPerCycle: 15,
      },
    ],
    initCycleDuration: 12,
  },
  [RecipesEnum.Alternate_Leached_Iron_Ingot]: {
    recipeName: RecipesEnum.Alternate_Leached_Iron_Ingot,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ore],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfuric_Acid],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ingot],
        quantityPerCycle: 10,
      },
    ],
    initCycleDuration: 6,
  },
  // Iron_Plate
  [RecipesEnum.Iron_Plate]: {
    recipeName: RecipesEnum.Iron_Plate,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ingot],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Plate],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Alternate_Coated_Iron_Plate]: {
    recipeName: RecipesEnum.Alternate_Coated_Iron_Plate,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ingot],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Plastic],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Plate],
        quantityPerCycle: 10,
      },
    ],
    initCycleDuration: 8,
  },
  [RecipesEnum.Alternate_Steel_Cast_Plate]: {
    recipeName: RecipesEnum.Alternate_Steel_Cast_Plate,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Foundry],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ingot],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Ingot],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Plate],
        quantityPerCycle: 3,
      },
    ],
    initCycleDuration: 4,
  },
  // Iron_Rod
  [RecipesEnum.Iron_Rod]: {
    recipeName: RecipesEnum.Iron_Rod,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ingot],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Rod],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 4,
  },
  [RecipesEnum.Alternate_Steel_Rod]: {
    recipeName: RecipesEnum.Alternate_Steel_Rod,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Ingot],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Rod],
        quantityPerCycle: 4,
      },
    ],
    initCycleDuration: 5,
  },
  [RecipesEnum.Alternate_Aluminum_Rod]: {
    recipeName: RecipesEnum.Alternate_Aluminum_Rod,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Ingot],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Rod],
        quantityPerCycle: 7,
      },
    ],
    initCycleDuration: 8,
  },
  // Copper_Ingot
  [RecipesEnum.Copper_Ingot]: {
    recipeName: RecipesEnum.Copper_Ingot,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Smelter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ore],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ingot],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 2,
  },
  [RecipesEnum.Alternate_Tempered_Copper_Ingot]: {
    recipeName: RecipesEnum.Alternate_Tempered_Copper_Ingot,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Foundry],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ore],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Petroleum_Coke],
        quantityPerCycle: 8,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ingot],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 12,
  },
  [RecipesEnum.Alternate_Pure_Copper_Ingot]: {
    recipeName: RecipesEnum.Alternate_Pure_Copper_Ingot,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ore],
        quantityPerCycle: 6,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 4,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ingot],
        quantityPerCycle: 15,
      },
    ],
    initCycleDuration: 24,
  },
  [RecipesEnum.Alternate_Copper_Alloy_Ingot]: {
    recipeName: RecipesEnum.Alternate_Copper_Alloy_Ingot,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Foundry],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ore],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ore],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ingot],
        quantityPerCycle: 10,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Alternate_Leached_Copper_Ingot]: {
    recipeName: RecipesEnum.Alternate_Leached_Copper_Ingot,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ore],
        quantityPerCycle: 9,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfuric_Acid],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ingot],
        quantityPerCycle: 22,
      },
    ],
    initCycleDuration: 12,
  },
  // Wire
  [RecipesEnum.Wire]: {
    recipeName: RecipesEnum.Wire,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ingot],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Wire],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 4,
  },
  [RecipesEnum.Alternate_Iron_Wire]: {
    recipeName: RecipesEnum.Alternate_Iron_Wire,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ingot],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Wire],
        quantityPerCycle: 9,
      },
    ],
    initCycleDuration: 24,
  },
  [RecipesEnum.Alternate_Caterium_Wire]: {
    recipeName: RecipesEnum.Alternate_Caterium_Wire,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Caterium_Ingot],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Wire],
        quantityPerCycle: 8,
      },
    ],
    initCycleDuration: 4,
  },
  [RecipesEnum.Alternate_Fused_Wire]: {
    recipeName: RecipesEnum.Alternate_Fused_Wire,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ingot],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Caterium_Ingot],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Wire],
        quantityPerCycle: 30,
      },
    ],
    initCycleDuration: 20,
  },
  // Cable
  [RecipesEnum.Cable]: {
    recipeName: RecipesEnum.Cable,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Wire],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Cable],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 2,
  },
  [RecipesEnum.Alternate_Coated_Cable]: {
    recipeName: RecipesEnum.Alternate_Coated_Cable,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Wire],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Heavy_Oil_Residue],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Cable],
        quantityPerCycle: 9,
      },
    ],
    initCycleDuration: 8,
  },
  [RecipesEnum.Alternate_Insulated_Cable]: {
    recipeName: RecipesEnum.Alternate_Insulated_Cable,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Wire],
        quantityPerCycle: 9,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Rubber],
        quantityPerCycle: 6,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Cable],
        quantityPerCycle: 20,
      },
    ],
    initCycleDuration: 12,
  },
  [RecipesEnum.Alternate_Quickwire_Cable]: {
    recipeName: RecipesEnum.Alternate_Quickwire_Cable,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Quickwire],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Rubber],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Cable],
        quantityPerCycle: 11,
      },
    ],
    initCycleDuration: 24,
  },
  // Concrete
  [RecipesEnum.Concrete]: {
    recipeName: RecipesEnum.Concrete,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Limestone],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Concrete],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 4,
  },
  [RecipesEnum.Alternate_Wet_Concrete]: {
    recipeName: RecipesEnum.Alternate_Wet_Concrete,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Limestone],
        quantityPerCycle: 6,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Concrete],
        quantityPerCycle: 4,
      },
    ],
    initCycleDuration: 3,
  },
  [RecipesEnum.Alternate_Rubber_Concrete]: {
    recipeName: RecipesEnum.Alternate_Rubber_Concrete,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Limestone],
        quantityPerCycle: 10,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Rubber],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Concrete],
        quantityPerCycle: 9,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Alternate_Fine_Concrete]: {
    recipeName: RecipesEnum.Alternate_Fine_Concrete,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Silica],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Limestone],
        quantityPerCycle: 12,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Concrete],
        quantityPerCycle: 10,
      },
    ],
    initCycleDuration: 12,
  },
  // Screw
  [RecipesEnum.Screw]: {
    recipeName: RecipesEnum.Screw,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Rod],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Screw],
        quantityPerCycle: 4,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Alternate_Cast_Screw]: {
    recipeName: RecipesEnum.Alternate_Cast_Screw,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ingot],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Screw],
        quantityPerCycle: 20,
      },
    ],
    initCycleDuration: 24,
  },
  [RecipesEnum.Alternate_Steel_Screw]: {
    recipeName: RecipesEnum.Alternate_Steel_Screw,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Beam],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Screw],
        quantityPerCycle: 52,
      },
    ],
    initCycleDuration: 12,
  },
  // Reinforced_Iron_Plate
  [RecipesEnum.Reinforced_Iron_Plate]: {
    recipeName: RecipesEnum.Reinforced_Iron_Plate,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Plate],
        quantityPerCycle: 6,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Screw],
        quantityPerCycle: 12,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reinforced_Iron_Plate],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 12,
  },
  [RecipesEnum.Alternate_Stitched_Iron_Plate]: {
    recipeName: RecipesEnum.Alternate_Stitched_Iron_Plate,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Plate],
        quantityPerCycle: 10,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Wire],
        quantityPerCycle: 20,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reinforced_Iron_Plate],
        quantityPerCycle: 3,
      },
    ],
    initCycleDuration: 32,
  },
  [RecipesEnum.Alternate_Bolted_Iron_Plate]: {
    recipeName: RecipesEnum.Alternate_Bolted_Iron_Plate,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Plate],
        quantityPerCycle: 18,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Screw],
        quantityPerCycle: 50,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reinforced_Iron_Plate],
        quantityPerCycle: 3,
      },
    ],
    initCycleDuration: 12,
  },
  [RecipesEnum.Alternate_Adhered_Iron_Plate]: {
    recipeName: RecipesEnum.Alternate_Adhered_Iron_Plate,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Plate],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Rubber],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reinforced_Iron_Plate],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 16,
  },
  // Biomass
  [RecipesEnum.Biomass_Wood]: {
    recipeName: RecipesEnum.Biomass_Wood,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Wood],
        quantityPerCycle: 4,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Biomass],
        quantityPerCycle: 20,
      },
    ],
    initCycleDuration: 4,
  },
  [RecipesEnum.Biomass_Leaves]: {
    recipeName: RecipesEnum.Biomass_Leaves,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Leaves],
        quantityPerCycle: 10,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Biomass],
        quantityPerCycle: 5,
      },
    ],
    initCycleDuration: 5,
  },
  [RecipesEnum.Biomass_Alien_Protein]: {
    recipeName: RecipesEnum.Biomass_Alien_Protein,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Alien_Protein],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Biomass],
        quantityPerCycle: 100,
      },
    ],
    initCycleDuration: 4,
  },
  [RecipesEnum.Biomass_Mycelia]: {
    recipeName: RecipesEnum.Biomass_Mycelia,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Mycelia],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Biomass],
        quantityPerCycle: 10,
      },
    ],
    initCycleDuration: 4,
  },

  // ========== Tier 2 items ==========
  // Copper_Sheet
  [RecipesEnum.Copper_Sheet]: {
    recipeName: RecipesEnum.Copper_Sheet,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ingot],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Sheet],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Alternate_Steamed_Copper_Sheet]: {
    recipeName: RecipesEnum.Alternate_Steamed_Copper_Sheet,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ingot],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Sheet],
        quantityPerCycle: 3,
      },
    ],
    initCycleDuration: 8,
  },
  // Rotor
  [RecipesEnum.Rotor]: {
    recipeName: RecipesEnum.Rotor,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Rod],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Screw],
        quantityPerCycle: 25,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Rotor],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 15,
  },
  [RecipesEnum.Alternate_Copper_Rotor]: {
    recipeName: RecipesEnum.Alternate_Copper_Rotor,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Sheet],
        quantityPerCycle: 6,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Screw],
        quantityPerCycle: 52,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Rotor],
        quantityPerCycle: 3,
      },
    ],
    initCycleDuration: 16,
  },
  [RecipesEnum.Alternate_Steel_Rotor]: {
    recipeName: RecipesEnum.Alternate_Steel_Rotor,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Pipe],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Wire],
        quantityPerCycle: 6,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Rotor],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 12,
  },
  // Modular_Frame
  [RecipesEnum.Modular_Frame]: {
    recipeName: RecipesEnum.Modular_Frame,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reinforced_Iron_Plate],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Rod],
        quantityPerCycle: 12,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Modular_Frame],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 60,
  },
  [RecipesEnum.Alternate_Steeled_Frame]: {
    recipeName: RecipesEnum.Alternate_Steeled_Frame,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reinforced_Iron_Plate],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Pipe],
        quantityPerCycle: 10,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Modular_Frame],
        quantityPerCycle: 3,
      },
    ],
    initCycleDuration: 60,
  },
  [RecipesEnum.Alternate_Bolted_Frame]: {
    recipeName: RecipesEnum.Alternate_Bolted_Frame,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reinforced_Iron_Plate],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Screw],
        quantityPerCycle: 56,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Modular_Frame],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 24,
  },
  // Smart_Plating
  [RecipesEnum.Smart_Plating]: {
    recipeName: RecipesEnum.Smart_Plating,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reinforced_Iron_Plate],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Rotor],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Smart_Plating],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 30,
  },
  [RecipesEnum.Alternate_Plastic_Smart_Plating]: {
    recipeName: RecipesEnum.Alternate_Plastic_Smart_Plating,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reinforced_Iron_Plate],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Rotor],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Plastic],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Smart_Plating],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 24,
  },
  // Solid_Biofuel
  [RecipesEnum.Solid_Biofuel]: {
    recipeName: RecipesEnum.Solid_Biofuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Biomass],
        quantityPerCycle: 8,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Solid_Biofuel],
        quantityPerCycle: 4,
      },
    ],
    initCycleDuration: 4,
  },

  // ========== Tier 3 items ==========
  // Steel_Ingot
  [RecipesEnum.Steel_Ingot]: {
    recipeName: RecipesEnum.Steel_Ingot,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Foundry],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ore],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Coal],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Ingot],
        quantityPerCycle: 3,
      },
    ],
    initCycleDuration: 4,
  },
  [RecipesEnum.Alternate_Solid_Steel_Ingot]: {
    recipeName: RecipesEnum.Alternate_Solid_Steel_Ingot,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Foundry],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ingot],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Coal],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Ingot],
        quantityPerCycle: 3,
      },
    ],
    initCycleDuration: 3,
  },
  [RecipesEnum.Alternate_Coke_Steel_Ingot]: {
    recipeName: RecipesEnum.Alternate_Coke_Steel_Ingot,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Foundry],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ore],
        quantityPerCycle: 15,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Petroleum_Coke],
        quantityPerCycle: 15,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Ingot],
        quantityPerCycle: 20,
      },
    ],
    initCycleDuration: 12,
  },
  [RecipesEnum.Alternate_Compacted_Steel_Ingot]: {
    recipeName: RecipesEnum.Alternate_Compacted_Steel_Ingot,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Foundry],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ore],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Compacted_Coal],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Ingot],
        quantityPerCycle: 4,
      },
    ],
    initCycleDuration: 24,
  },
  // Steel_Beam
  [RecipesEnum.Steel_Beam]: {
    recipeName: RecipesEnum.Steel_Beam,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Ingot],
        quantityPerCycle: 4,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Beam],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 4,
  },
  [RecipesEnum.Alternate_Molded_Beam]: {
    recipeName: RecipesEnum.Alternate_Molded_Beam,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Foundry],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Ingot],
        quantityPerCycle: 24,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Concrete],
        quantityPerCycle: 16,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Beam],
        quantityPerCycle: 9,
      },
    ],
    initCycleDuration: 12,
  },
  [RecipesEnum.Alternate_Aluminum_Beam]: {
    recipeName: RecipesEnum.Alternate_Aluminum_Beam,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Ingot],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Beam],
        quantityPerCycle: 3,
      },
    ],
    initCycleDuration: 8,
  },
  // Steel_Pipe
  [RecipesEnum.Steel_Pipe]: {
    recipeName: RecipesEnum.Steel_Pipe,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Ingot],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Pipe],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Alternate_Iron_Pipe]: {
    recipeName: RecipesEnum.Alternate_Iron_Pipe,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ingot],
        quantityPerCycle: 20,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Pipe],
        quantityPerCycle: 5,
      },
    ],
    initCycleDuration: 12,
  },
  [RecipesEnum.Alternate_Molded_Steel_Pipe]: {
    recipeName: RecipesEnum.Alternate_Molded_Steel_Pipe,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Foundry],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Ingot],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Concrete],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Pipe],
        quantityPerCycle: 5,
      },
    ],
    initCycleDuration: 6,
  },
  // Versatile_Framework
  [RecipesEnum.Versatile_Framework]: {
    recipeName: RecipesEnum.Versatile_Framework,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Modular_Frame],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Beam],
        quantityPerCycle: 12,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Versatile_Framework],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 24,
  },
  [RecipesEnum.Alternate_Flexible_Framework]: {
    recipeName: RecipesEnum.Alternate_Flexible_Framework,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Modular_Frame],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Beam],
        quantityPerCycle: 6,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Rubber],
        quantityPerCycle: 8,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Versatile_Framework],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 16,
  },

  // ========== Tier 4 items ==========
  // Encased_Industrial_Beam
  [RecipesEnum.Encased_Industrial_Beam]: {
    recipeName: RecipesEnum.Encased_Industrial_Beam,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Beam],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Concrete],
        quantityPerCycle: 6,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Encased_Industrial_Beam],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 10,
  },
  [RecipesEnum.Alternate_Encased_Industrial_Pipe]: {
    recipeName: RecipesEnum.Alternate_Encased_Industrial_Pipe,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Pipe],
        quantityPerCycle: 6,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Concrete],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Encased_Industrial_Beam],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 15,
  },
  // Stator
  [RecipesEnum.Stator]: {
    recipeName: RecipesEnum.Stator,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Pipe],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Wire],
        quantityPerCycle: 8,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Stator],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 12,
  },
  [RecipesEnum.Alternate_Quickwire_Stator]: {
    recipeName: RecipesEnum.Alternate_Quickwire_Stator,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Pipe],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Quickwire],
        quantityPerCycle: 15,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Stator],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 15,
  },
  // Motor
  [RecipesEnum.Motor]: {
    recipeName: RecipesEnum.Motor,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Rotor],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Stator],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Motor],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 12,
  },
  [RecipesEnum.Alternate_Rigor_Motor]: {
    recipeName: RecipesEnum.Alternate_Rigor_Motor,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Rotor],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Stator],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Crystal_Oscillator],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Motor],
        quantityPerCycle: 6,
      },
    ],
    initCycleDuration: 48,
  },
  [RecipesEnum.Alternate_Electric_Motor]: {
    recipeName: RecipesEnum.Alternate_Electric_Motor,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Electromagnetic_Control_Rod],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Rotor],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Motor],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 16,
  },
  // Automated_Wiring
  [RecipesEnum.Automated_Wiring]: {
    recipeName: RecipesEnum.Automated_Wiring,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Stator],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Cable],
        quantityPerCycle: 20,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Automated_Wiring],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 24,
  },
  [RecipesEnum.Alternate_Automated_Speed_Wiring]: {
    recipeName: RecipesEnum.Alternate_Automated_Speed_Wiring,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Stator],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Wire],
        quantityPerCycle: 40,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.High_Speed_Connector],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Automated_Wiring],
        quantityPerCycle: 4,
      },
    ],
    initCycleDuration: 32,
  },

  // ========== Tier 5 items ==========
  // Plastic
  [RecipesEnum.Residual_Plastic]: {
    recipeName: RecipesEnum.Residual_Plastic,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Polymer_Resin],
        quantityPerCycle: 6,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Plastic],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Plastic]: {
    recipeName: RecipesEnum.Plastic,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Crude_Oil],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Plastic],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Heavy_Oil_Residue],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Alternate_Recycled_Plastic]: {
    recipeName: RecipesEnum.Alternate_Recycled_Plastic,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Rubber],
        quantityPerCycle: 6,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Fuel],
        quantityPerCycle: 6,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Plastic],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 12,
  },
  // Rubber
  [RecipesEnum.Residual_Rubber]: {
    recipeName: RecipesEnum.Residual_Rubber,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Polymer_Resin],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 4,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Rubber],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Rubber]: {
    recipeName: RecipesEnum.Rubber,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Crude_Oil],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Rubber],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Heavy_Oil_Residue],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Alternate_Recycled_Rubber]: {
    recipeName: RecipesEnum.Alternate_Recycled_Rubber,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Plastic],
        quantityPerCycle: 6,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Fuel],
        quantityPerCycle: 6,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Rubber],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 12,
  },
  // Polymer_Resin
  [RecipesEnum.Alternate_Polymer_Resin]: {
    recipeName: RecipesEnum.Alternate_Polymer_Resin,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Crude_Oil],
        quantityPerCycle: 6,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Polymer_Resin],
        quantityPerCycle: 13,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Heavy_Oil_Residue],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 6,
  },
  // Petroleum_Coke
  [RecipesEnum.Petroleum_Coke]: {
    recipeName: RecipesEnum.Petroleum_Coke,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Heavy_Oil_Residue],
        quantityPerCycle: 4,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Petroleum_Coke],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 6,
  },
  // Circuit_Board
  [RecipesEnum.Circuit_Board]: {
    recipeName: RecipesEnum.Circuit_Board,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Sheet],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Plastic],
        quantityPerCycle: 4,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Circuit_Board],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 8,
  },
  [RecipesEnum.Alternate_Electrode_Circuit_Board]: {
    recipeName: RecipesEnum.Alternate_Electrode_Circuit_Board,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Rubber],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Petroleum_Coke],
        quantityPerCycle: 8,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Circuit_Board],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 12,
  },
  [RecipesEnum.Alternate_Caterium_Circuit_Board]: {
    recipeName: RecipesEnum.Alternate_Caterium_Circuit_Board,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Plastic],
        quantityPerCycle: 10,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Quickwire],
        quantityPerCycle: 30,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Circuit_Board],
        quantityPerCycle: 7,
      },
    ],
    initCycleDuration: 48,
  },
  [RecipesEnum.Alternate_Silicon_Circuit_Board]: {
    recipeName: RecipesEnum.Alternate_Silicon_Circuit_Board,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Sheet],
        quantityPerCycle: 11,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Silica],
        quantityPerCycle: 11,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Circuit_Board],
        quantityPerCycle: 5,
      },
    ],
    initCycleDuration: 24,
  },
  // Fuel
  [RecipesEnum.Residual_Fuel]: {
    recipeName: RecipesEnum.Residual_Fuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Heavy_Oil_Residue],
        quantityPerCycle: 6,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Fuel],
        quantityPerCycle: 4,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Fuel]: {
    recipeName: RecipesEnum.Fuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Crude_Oil],
        quantityPerCycle: 6,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Fuel],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Polymer_Resin],
        quantityPerCycle: 3,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Unpackage_Fuel]: {
    recipeName: RecipesEnum.Unpackage_Fuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Fuel],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Fuel],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Canister],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 2,
  },
  [RecipesEnum.Alternate_Diluted_Fuel]: {
    recipeName: RecipesEnum.Alternate_Diluted_Fuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Blender],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Heavy_Oil_Residue],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 10,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Fuel],
        quantityPerCycle: 10,
      },
    ],
    initCycleDuration: 6,
  },
  // Packaged_Fuel
  [RecipesEnum.Packaged_Fuel]: {
    recipeName: RecipesEnum.Packaged_Fuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Fuel],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Canister],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Fuel],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 3,
  },
  [RecipesEnum.Alternate_Diluted_Packaged_Fuel]: {
    recipeName: RecipesEnum.Alternate_Diluted_Packaged_Fuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Heavy_Oil_Residue],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Water],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Fuel],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 2,
  },
  // Heavy_Oil_Residue
  [RecipesEnum.Alternate_Heavy_Oil_Residue]: {
    recipeName: RecipesEnum.Alternate_Heavy_Oil_Residue,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Crude_Oil],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Heavy_Oil_Residue],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Polymer_Resin],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Unpackage_Heavy_Oil_Residue]: {
    recipeName: RecipesEnum.Unpackage_Heavy_Oil_Residue,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Heavy_Oil_Residue],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Heavy_Oil_Residue],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Canister],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 6,
  },
  // Packaged_Heavy_Oil_Residue
  [RecipesEnum.Packaged_Heavy_Oil_Residue]: {
    recipeName: RecipesEnum.Packaged_Heavy_Oil_Residue,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Heavy_Oil_Residue],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Canister],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Heavy_Oil_Residue],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 4,
  },
  // Liquid_Biofuel
  [RecipesEnum.Liquid_Biofuel]: {
    recipeName: RecipesEnum.Liquid_Biofuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Solid_Biofuel],
        quantityPerCycle: 6,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Liquid_Biofuel],
        quantityPerCycle: 4,
      },
    ],
    initCycleDuration: 4,
  },
  [RecipesEnum.Unpackage_Liquid_Biofuel]: {
    recipeName: RecipesEnum.Unpackage_Liquid_Biofuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Liquid_Biofuel],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Liquid_Biofuel],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Canister],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 2,
  },
  // Packaged_Liquid_Biofuel
  [RecipesEnum.Packaged_Liquid_Biofuel]: {
    recipeName: RecipesEnum.Packaged_Liquid_Biofuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Liquid_Biofuel],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Canister],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Liquid_Biofuel],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 3,
  },
  // Empty_Canister
  [RecipesEnum.Empty_Canister]: {
    recipeName: RecipesEnum.Empty_Canister,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Plastic],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Canister],
        quantityPerCycle: 4,
      },
    ],
    initCycleDuration: 4,
  },
  [RecipesEnum.Alternate_Steel_Canister]: {
    recipeName: RecipesEnum.Alternate_Steel_Canister,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Ingot],
        quantityPerCycle: 4,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Canister],
        quantityPerCycle: 4,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Alternate_Coated_Iron_Canister]: {
    recipeName: RecipesEnum.Alternate_Coated_Iron_Canister,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Plate],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Sheet],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Canister],
        quantityPerCycle: 4,
      },
    ],
    initCycleDuration: 4,
  },

  // ========== Tier 6 items ==========
  // Computer
  [RecipesEnum.Computer]: {
    recipeName: RecipesEnum.Computer,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Circuit_Board],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Cable],
        quantityPerCycle: 8,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Plastic],
        quantityPerCycle: 16,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Computer],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 24,
  },
  [RecipesEnum.Alternate_Crystal_Computer]: {
    recipeName: RecipesEnum.Alternate_Crystal_Computer,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Circuit_Board],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Crystal_Oscillator],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Computer],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 36,
  },
  [RecipesEnum.Alternate_Caterium_Computer]: {
    recipeName: RecipesEnum.Alternate_Caterium_Computer,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Circuit_Board],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Quickwire],
        quantityPerCycle: 14,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Rubber],
        quantityPerCycle: 6,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Computer],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 16,
  },
  // Heavy_Modular_Frame
  [RecipesEnum.Heavy_Modular_Frame]: {
    recipeName: RecipesEnum.Heavy_Modular_Frame,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Modular_Frame],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Pipe],
        quantityPerCycle: 20,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Encased_Industrial_Beam],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Screw],
        quantityPerCycle: 120,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Heavy_Modular_Frame],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 30,
  },
  [RecipesEnum.Alternate_Heavy_Encased_Frame]: {
    recipeName: RecipesEnum.Alternate_Heavy_Encased_Frame,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Modular_Frame],
        quantityPerCycle: 8,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Encased_Industrial_Beam],
        quantityPerCycle: 10,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Pipe],
        quantityPerCycle: 36,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Concrete],
        quantityPerCycle: 22,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Heavy_Modular_Frame],
        quantityPerCycle: 3,
      },
    ],
    initCycleDuration: 64,
  },
  [RecipesEnum.Alternate_Heavy_Flexible_Frame]: {
    recipeName: RecipesEnum.Alternate_Heavy_Flexible_Frame,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Modular_Frame],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Encased_Industrial_Beam],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Rubber],
        quantityPerCycle: 20,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Screw],
        quantityPerCycle: 104,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Heavy_Modular_Frame],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 16,
  },
  // Modular_Engine
  [RecipesEnum.Modular_Engine]: {
    recipeName: RecipesEnum.Modular_Engine,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Motor],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Rubber],
        quantityPerCycle: 15,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Smart_Plating],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Modular_Engine],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 60,
  },
  // Adaptive_Control_Unit
  [RecipesEnum.Adaptive_Control_Unit]: {
    recipeName: RecipesEnum.Adaptive_Control_Unit,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Automated_Wiring],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Circuit_Board],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Heavy_Modular_Frame],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Computer],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Adaptive_Control_Unit],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 60,
  },

  // ========== Tier 7 items ==========
  // Alumina_Solution
  [RecipesEnum.Alumina_Solution]: {
    recipeName: RecipesEnum.Alumina_Solution,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Bauxite],
        quantityPerCycle: 12,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 18,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Alumina_Solution],
        quantityPerCycle: 12,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Silica],
        quantityPerCycle: 5,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Unpackage_Alumina_Solution]: {
    recipeName: RecipesEnum.Unpackage_Alumina_Solution,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Alumina_Solution],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Alumina_Solution],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Canister],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 1,
  },
  [RecipesEnum.Alternate_Sloppy_Alumina]: {
    recipeName: RecipesEnum.Alternate_Sloppy_Alumina,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Bauxite],
        quantityPerCycle: 10,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 10,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Alumina_Solution],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 3,
  },
  // Packaged_Alumina_Solution
  [RecipesEnum.Packaged_Alumina_Solution]: {
    recipeName: RecipesEnum.Packaged_Alumina_Solution,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Alumina_Solution],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Canister],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Alumina_Solution],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 1,
  },
  // Aluminum_Scrap
  [RecipesEnum.Aluminum_Scrap]: {
    recipeName: RecipesEnum.Aluminum_Scrap,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Alumina_Solution],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Coal],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Scrap],
        quantityPerCycle: 6,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 1,
  },
  [RecipesEnum.Alternate_Instant_Scrap]: {
    recipeName: RecipesEnum.Alternate_Instant_Scrap,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Blender],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Bauxite],
        quantityPerCycle: 15,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Coal],
        quantityPerCycle: 10,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfuric_Acid],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 6,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Scrap],
        quantityPerCycle: 30,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 5,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Alternate_Electrode_Aluminum_Scrap]: {
    recipeName: RecipesEnum.Alternate_Electrode_Aluminum_Scrap,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Alumina_Solution],
        quantityPerCycle: 12,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Petroleum_Coke],
        quantityPerCycle: 4,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Scrap],
        quantityPerCycle: 20,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 7,
      },
    ],
    initCycleDuration: 4,
  },
  // Aluminum_Ingot
  [RecipesEnum.Aluminum_Ingot]: {
    recipeName: RecipesEnum.Aluminum_Ingot,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Foundry],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Scrap],
        quantityPerCycle: 6,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Silica],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Ingot],
        quantityPerCycle: 4,
      },
    ],
    initCycleDuration: 4,
  },
  [RecipesEnum.Alternate_Pure_Aluminum_Ingot]: {
    recipeName: RecipesEnum.Alternate_Pure_Aluminum_Ingot,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Smelter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Scrap],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Ingot],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 2,
  },
  // Alclad_Aluminum_Sheet
  [RecipesEnum.Alclad_Aluminum_Sheet]: {
    recipeName: RecipesEnum.Alclad_Aluminum_Sheet,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Ingot],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ingot],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Alclad_Aluminum_Sheet],
        quantityPerCycle: 3,
      },
    ],
    initCycleDuration: 6,
  },
  // Aluminum_Casing
  [RecipesEnum.Aluminum_Casing]: {
    recipeName: RecipesEnum.Aluminum_Casing,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Ingot],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Casing],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 2,
  },
  [RecipesEnum.Alternate_Alclad_Casing]: {
    recipeName: RecipesEnum.Alternate_Alclad_Casing,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Ingot],
        quantityPerCycle: 20,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ingot],
        quantityPerCycle: 10,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Casing],
        quantityPerCycle: 15,
      },
    ],
    initCycleDuration: 8,
  },
  // Radio_Control_Unit
  [RecipesEnum.Radio_Control_Unit]: {
    recipeName: RecipesEnum.Radio_Control_Unit,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Casing],
        quantityPerCycle: 32,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Crystal_Oscillator],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Computer],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Radio_Control_Unit],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 48,
  },
  [RecipesEnum.Alternate_Radio_Connection_Unit]: {
    recipeName: RecipesEnum.Alternate_Radio_Connection_Unit,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Heat_Sink],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.High_Speed_Connector],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Quartz_Crystal],
        quantityPerCycle: 12,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Radio_Control_Unit],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 16,
  },
  [RecipesEnum.Alternate_Radio_Control_System]: {
    recipeName: RecipesEnum.Alternate_Radio_Control_System,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Crystal_Oscillator],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Circuit_Board],
        quantityPerCycle: 10,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Casing],
        quantityPerCycle: 60,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Rubber],
        quantityPerCycle: 30,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Radio_Control_Unit],
        quantityPerCycle: 3,
      },
    ],
    initCycleDuration: 40,
  },
  // Sulfuric_Acid
  [RecipesEnum.Sulfuric_Acid]: {
    recipeName: RecipesEnum.Sulfuric_Acid,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfur],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfuric_Acid],
        quantityPerCycle: 5,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Unpackage_Sulfuric_Acid]: {
    recipeName: RecipesEnum.Unpackage_Sulfuric_Acid,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Sulfuric_Acid],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfuric_Acid],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Canister],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 1,
  },
  // Packaged_Sulfuric_Acid
  [RecipesEnum.Packaged_Sulfuric_Acid]: {
    recipeName: RecipesEnum.Packaged_Sulfuric_Acid,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfuric_Acid],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Canister],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Sulfuric_Acid],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 3,
  },
  // Battery
  [RecipesEnum.Battery]: {
    recipeName: RecipesEnum.Battery,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Blender],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfuric_Acid],
        quantityPerCycle: 2.5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Alumina_Solution],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Casing],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Battery],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 1.5,
      },
    ],
    initCycleDuration: 3,
  },
  [RecipesEnum.Alternate_Classic_Battery]: {
    recipeName: RecipesEnum.Alternate_Classic_Battery,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfur],
        quantityPerCycle: 6,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Alclad_Aluminum_Sheet],
        quantityPerCycle: 7,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Plastic],
        quantityPerCycle: 8,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Wire],
        quantityPerCycle: 12,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Battery],
        quantityPerCycle: 4,
      },
    ],
    initCycleDuration: 8,
  },
  // Supercomputer
  [RecipesEnum.Supercomputer]: {
    recipeName: RecipesEnum.Supercomputer,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Computer],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.AI_Limiter],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.High_Speed_Connector],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Plastic],
        quantityPerCycle: 28,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Supercomputer],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 32,
  },
  [RecipesEnum.Alternate_OC_Supercomputer]: {
    recipeName: RecipesEnum.Alternate_OC_Supercomputer,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Radio_Control_Unit],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Cooling_System],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Supercomputer],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 20,
  },
  [RecipesEnum.Alternate_Super_State_Computer]: {
    recipeName: RecipesEnum.Alternate_Super_State_Computer,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Computer],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Electromagnetic_Control_Rod],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Battery],
        quantityPerCycle: 10,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Wire],
        quantityPerCycle: 25,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Supercomputer],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 25,
  },
  // Assembly_Director_System
  [RecipesEnum.Assembly_Director_System]: {
    recipeName: RecipesEnum.Assembly_Director_System,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Adaptive_Control_Unit],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Supercomputer],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Assembly_Director_System],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 80,
  },

  // ========== Tier 8 items ==========
  // Encased_Uranium_Cell
  [RecipesEnum.Encased_Uranium_Cell]: {
    recipeName: RecipesEnum.Encased_Uranium_Cell,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Blender],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Uranium],
        quantityPerCycle: 10,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Concrete],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfuric_Acid],
        quantityPerCycle: 8,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Encased_Uranium_Cell],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfuric_Acid],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 12,
  },
  [RecipesEnum.Alternate_Infused_Uranium_Cell]: {
    recipeName: RecipesEnum.Alternate_Infused_Uranium_Cell,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Uranium],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Silica],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfur],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Quickwire],
        quantityPerCycle: 15,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Encased_Uranium_Cell],
        quantityPerCycle: 4,
      },
    ],
    initCycleDuration: 12,
  },
  // Electromagnetic_Control_Rod
  [RecipesEnum.Electromagnetic_Control_Rod]: {
    recipeName: RecipesEnum.Electromagnetic_Control_Rod,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Stator],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.AI_Limiter],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Electromagnetic_Control_Rod],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 30,
  },
  [RecipesEnum.Alternate_Electromagnetic_Connection_Rod]: {
    recipeName: RecipesEnum.Alternate_Electromagnetic_Connection_Rod,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Stator],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.High_Speed_Connector],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Electromagnetic_Control_Rod],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 15,
  },
  // Uranium_Fuel_Rod
  [RecipesEnum.Uranium_Fuel_Rod]: {
    recipeName: RecipesEnum.Uranium_Fuel_Rod,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Encased_Uranium_Cell],
        quantityPerCycle: 50,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Encased_Industrial_Beam],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Electromagnetic_Control_Rod],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Uranium_Fuel_Rod],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 150,
  },
  [RecipesEnum.Alternate_Uranium_Fuel_Unit]: {
    recipeName: RecipesEnum.Alternate_Uranium_Fuel_Unit,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Encased_Uranium_Cell],
        quantityPerCycle: 100,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Electromagnetic_Control_Rod],
        quantityPerCycle: 10,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Crystal_Oscillator],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Rotor],
        quantityPerCycle: 10,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Uranium_Fuel_Rod],
        quantityPerCycle: 3,
      },
    ],
    initCycleDuration: 300,
  },
  // Magnetic_Field_Generator
  [RecipesEnum.Magnetic_Field_Generator]: {
    recipeName: RecipesEnum.Magnetic_Field_Generator,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Versatile_Framework],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Electromagnetic_Control_Rod],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Magnetic_Field_Generator],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 120,
  },
  // Empty_Fluid_Tank
  [RecipesEnum.Empty_Fluid_Tank]: {
    recipeName: RecipesEnum.Empty_Fluid_Tank,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Ingot],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Fluid_Tank],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 1,
  },
  // Heat_Sink
  [RecipesEnum.Alternate_Heat_Exchanger]: {
    recipeName: RecipesEnum.Alternate_Heat_Exchanger,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Casing],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Rubber],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Heat_Sink],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Heat_Sink]: {
    recipeName: RecipesEnum.Heat_Sink,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Alclad_Aluminum_Sheet],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Sheet],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Heat_Sink],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 8,
  },
  // Cooling_System
  [RecipesEnum.Cooling_System]: {
    recipeName: RecipesEnum.Cooling_System,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Blender],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Heat_Sink],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Rubber],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Nitrogen_Gas],
        quantityPerCycle: 25,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Cooling_System],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 10,
  },
  [RecipesEnum.Alternate_Cooling_Device]: {
    recipeName: RecipesEnum.Alternate_Cooling_Device,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Blender],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Heat_Sink],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Motor],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Nitrogen_Gas],
        quantityPerCycle: 24,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Cooling_System],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 24,
  },
  // Fused_Modular_Frame
  [RecipesEnum.Fused_Modular_Frame]: {
    recipeName: RecipesEnum.Fused_Modular_Frame,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Blender],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Heavy_Modular_Frame],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Casing],
        quantityPerCycle: 50,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Nitrogen_Gas],
        quantityPerCycle: 25,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Fused_Modular_Frame],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 40,
  },
  [RecipesEnum.Alternate_Heat_Fused_Frame]: {
    recipeName: RecipesEnum.Alternate_Heat_Fused_Frame,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Blender],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Heavy_Modular_Frame],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Ingot],
        quantityPerCycle: 50,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Nitric_Acid],
        quantityPerCycle: 8,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Fuel],
        quantityPerCycle: 10,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Fused_Modular_Frame],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 20,
  },
  // Turbo_Motor
  [RecipesEnum.Turbo_Motor]: {
    recipeName: RecipesEnum.Turbo_Motor,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Cooling_System],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Radio_Control_Unit],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Motor],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Rubber],
        quantityPerCycle: 24,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Turbo_Motor],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 32,
  },
  [RecipesEnum.Alternate_Turbo_Pressure_Motor]: {
    recipeName: RecipesEnum.Alternate_Turbo_Pressure_Motor,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Motor],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Pressure_Conversion_Cube],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Nitrogen_Gas],
        quantityPerCycle: 24,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Stator],
        quantityPerCycle: 8,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Turbo_Motor],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 32,
  },
  [RecipesEnum.Alternate_Turbo_Electric_Motor]: {
    recipeName: RecipesEnum.Alternate_Turbo_Electric_Motor,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Motor],
        quantityPerCycle: 7,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Radio_Control_Unit],
        quantityPerCycle: 9,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Electromagnetic_Control_Rod],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Rotor],
        quantityPerCycle: 7,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Turbo_Motor],
        quantityPerCycle: 3,
      },
    ],
    initCycleDuration: 64,
  },
  // Thermal_Propulsion_Rocket
  [RecipesEnum.Thermal_Propulsion_Rocket]: {
    recipeName: RecipesEnum.Thermal_Propulsion_Rocket,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Modular_Engine],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Turbo_Motor],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Cooling_System],
        quantityPerCycle: 6,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Fused_Modular_Frame],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Thermal_Propulsion_Rocket],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 120,
  },
  // Nitric_Acid
  [RecipesEnum.Nitric_Acid]: {
    recipeName: RecipesEnum.Nitric_Acid,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Blender],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Nitrogen_Gas],
        quantityPerCycle: 12,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Plate],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Nitric_Acid],
        quantityPerCycle: 3,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Unpackage_Nitric_Acid]: {
    recipeName: RecipesEnum.Unpackage_Nitric_Acid,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Nitric_Acid],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Nitric_Acid],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Fluid_Tank],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 3,
  },
  // Packaged_Nitric_Acid
  [RecipesEnum.Packaged_Nitric_Acid]: {
    recipeName: RecipesEnum.Packaged_Nitric_Acid,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Nitric_Acid],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Fluid_Tank],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Nitric_Acid],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 2,
  },
  // Non_Fissile_Uranium
  [RecipesEnum.Non_Fissile_Uranium]: {
    recipeName: RecipesEnum.Non_Fissile_Uranium,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Blender],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Uranium_Waste],
        quantityPerCycle: 15,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Silica],
        quantityPerCycle: 10,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Nitric_Acid],
        quantityPerCycle: 6,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfuric_Acid],
        quantityPerCycle: 6,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Non_Fissile_Uranium],
        quantityPerCycle: 20,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 6,
      },
    ],
    initCycleDuration: 24,
  },
  [RecipesEnum.Alternate_Fertile_Uranium]: {
    recipeName: RecipesEnum.Alternate_Fertile_Uranium,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Blender],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Uranium],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Uranium_Waste],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Nitric_Acid],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfuric_Acid],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Non_Fissile_Uranium],
        quantityPerCycle: 20,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 8,
      },
    ],
    initCycleDuration: 12,
  },
  // Plutonium_Pellet
  [RecipesEnum.Plutonium_Pellet]: {
    recipeName: RecipesEnum.Plutonium_Pellet,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Particle_Accelerator],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Non_Fissile_Uranium],
        quantityPerCycle: 100,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Uranium_Waste],
        quantityPerCycle: 25,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Plutonium_Pellet],
        quantityPerCycle: 30,
      },
    ],
    initCycleDuration: 60,
  },
  // Encased_Plutonium_Cell
  [RecipesEnum.Encased_Plutonium_Cell]: {
    recipeName: RecipesEnum.Encased_Plutonium_Cell,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Plutonium_Pellet],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Concrete],
        quantityPerCycle: 4,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Encased_Plutonium_Cell],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 12,
  },
  [RecipesEnum.Alternate_Instant_Plutonium_Cell]: {
    recipeName: RecipesEnum.Alternate_Instant_Plutonium_Cell,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Particle_Accelerator],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Non_Fissile_Uranium],
        quantityPerCycle: 150,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Casing],
        quantityPerCycle: 20,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Encased_Plutonium_Cell],
        quantityPerCycle: 20,
      },
    ],
    initCycleDuration: 120,
  },
  // Plutonium_Fuel_Rod
  [RecipesEnum.Plutonium_Fuel_Rod]: {
    recipeName: RecipesEnum.Plutonium_Fuel_Rod,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Encased_Plutonium_Cell],
        quantityPerCycle: 30,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Beam],
        quantityPerCycle: 18,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Electromagnetic_Control_Rod],
        quantityPerCycle: 6,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Heat_Sink],
        quantityPerCycle: 10,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Plutonium_Fuel_Rod],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 240,
  },
  [RecipesEnum.Alternate_Plutonium_Fuel_Unit]: {
    recipeName: RecipesEnum.Alternate_Plutonium_Fuel_Unit,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Encased_Plutonium_Cell],
        quantityPerCycle: 20,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Pressure_Conversion_Cube],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Plutonium_Fuel_Rod],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 120,
  },
  // Copper_Powder
  [RecipesEnum.Copper_Powder]: {
    recipeName: RecipesEnum.Copper_Powder,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ingot],
        quantityPerCycle: 30,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Powder],
        quantityPerCycle: 5,
      },
    ],
    initCycleDuration: 6,
  },
  // Pressure_Conversion_Cube
  [RecipesEnum.Pressure_Conversion_Cube]: {
    recipeName: RecipesEnum.Pressure_Conversion_Cube,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Fused_Modular_Frame],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Radio_Control_Unit],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Pressure_Conversion_Cube],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 60,
  },
  // Nuclear_Pasta
  [RecipesEnum.Nuclear_Pasta]: {
    recipeName: RecipesEnum.Nuclear_Pasta,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Particle_Accelerator],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Powder],
        quantityPerCycle: 200,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Pressure_Conversion_Cube],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Nuclear_Pasta],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 120,
  },

  // ========== Tier 9 items ==========
  // Diamonds
  [RecipesEnum.Diamonds]: {
    recipeName: RecipesEnum.Diamonds,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Particle_Accelerator],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Coal],
        quantityPerCycle: 20,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Diamonds],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 2,
  },
  [RecipesEnum.Alternate_Petroleum_Diamonds]: {
    recipeName: RecipesEnum.Alternate_Petroleum_Diamonds,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Particle_Accelerator],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Petroleum_Coke],
        quantityPerCycle: 24,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Diamonds],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 2,
  },
  [RecipesEnum.Alternate_Oil_Based_Diamonds]: {
    recipeName: RecipesEnum.Alternate_Oil_Based_Diamonds,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Particle_Accelerator],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Crude_Oil],
        quantityPerCycle: 10,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Diamonds],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 3,
  },
  [RecipesEnum.Alternate_Pink_Diamonds]: {
    recipeName: RecipesEnum.Alternate_Pink_Diamonds,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Coal],
        quantityPerCycle: 8,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Quartz_Crystal],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Diamonds],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 4,
  },
  [RecipesEnum.Alternate_Cloudy_Diamonds]: {
    recipeName: RecipesEnum.Alternate_Cloudy_Diamonds,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Particle_Accelerator],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Coal],
        quantityPerCycle: 12,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Limestone],
        quantityPerCycle: 24,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Diamonds],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 3,
  },
  [RecipesEnum.Alternate_Turbo_Diamonds]: {
    recipeName: RecipesEnum.Alternate_Turbo_Diamonds,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Particle_Accelerator],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Coal],
        quantityPerCycle: 30,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Turbofuel],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Diamonds],
        quantityPerCycle: 3,
      },
    ],
    initCycleDuration: 3,
  },
  // Time_Crystal
  [RecipesEnum.Time_Crystal]: {
    recipeName: RecipesEnum.Time_Crystal,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Diamonds],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Time_Crystal],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 10,
  },
  // Ficsite_Ingot
  [RecipesEnum.Ficsite_Ingot_Iron]: {
    recipeName: RecipesEnum.Ficsite_Ingot_Iron,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ingot],
        quantityPerCycle: 24,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Ficsite_Ingot],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Ficsite_Ingot_Aluminum]: {
    recipeName: RecipesEnum.Ficsite_Ingot_Aluminum,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Ingot],
        quantityPerCycle: 4,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Ficsite_Ingot],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 2,
  },
  [RecipesEnum.Ficsite_Ingot_Caterium]: {
    recipeName: RecipesEnum.Ficsite_Ingot_Caterium,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Caterium_Ingot],
        quantityPerCycle: 4,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Ficsite_Ingot],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 4,
  },
  // Ficsite_Trigon
  [RecipesEnum.Ficsite_Trigon]: {
    recipeName: RecipesEnum.Ficsite_Trigon,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Ficsite_Trigon],
        quantityPerCycle: 3,
      },
    ],
    initCycleDuration: 6,
  },
  // Biochemical_Sculptor
  [RecipesEnum.Biochemical_Sculptor]: {
    recipeName: RecipesEnum.Biochemical_Sculptor,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Blender],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Assembly_Director_System],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Ficsite_Trigon],
        quantityPerCycle: 80,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 20,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Biochemical_Sculptor],
        quantityPerCycle: 4,
      },
    ],
    initCycleDuration: 120,
  },
  // Excited_Photonic_Matter
  [RecipesEnum.Excited_Photonic_Matter]: {
    recipeName: RecipesEnum.Excited_Photonic_Matter,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Excited_Photonic_Matter],
        quantityPerCycle: 10,
      },
    ],
    initCycleDuration: 3,
  },
  // Dark_Matter_Residue
  [RecipesEnum.Dark_Matter_Residue]: {
    recipeName: RecipesEnum.Dark_Matter_Residue,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Dark_Matter_Residue],
        quantityPerCycle: 10,
      },
    ],
    initCycleDuration: 6,
  },
  // Dark_Matter_Crystal
  [RecipesEnum.Dark_Matter_Crystal]: {
    recipeName: RecipesEnum.Dark_Matter_Crystal,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Particle_Accelerator],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Diamonds],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Dark_Matter_Residue],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Dark_Matter_Crystal],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 2,
  },
  [RecipesEnum.Alternate_Dark_Matter_Crystallization]: {
    recipeName: RecipesEnum.Alternate_Dark_Matter_Crystallization,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Particle_Accelerator],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Dark_Matter_Residue],
        quantityPerCycle: 10,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Dark_Matter_Crystal],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 3,
  },
  [RecipesEnum.Alternate_Dark_Matter_Trap]: {
    recipeName: RecipesEnum.Alternate_Dark_Matter_Trap,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Particle_Accelerator],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Time_Crystal],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Dark_Matter_Residue],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Dark_Matter_Crystal],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 2,
  },
  // Superposition_Oscillator
  [RecipesEnum.Superposition_Oscillator]: {
    recipeName: RecipesEnum.Superposition_Oscillator,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Quantum_Encoder],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Dark_Matter_Crystal],
        quantityPerCycle: 6,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Crystal_Oscillator],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Alclad_Aluminum_Sheet],
        quantityPerCycle: 9,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Excited_Photonic_Matter],
        quantityPerCycle: 25,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Superposition_Oscillator],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Dark_Matter_Residue],
        quantityPerCycle: 25,
      },
    ],
    initCycleDuration: 12,
  },
  // Neural_Quantum_Processor
  [RecipesEnum.Neural_Quantum_Processor]: {
    recipeName: RecipesEnum.Neural_Quantum_Processor,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Quantum_Encoder],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Time_Crystal],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Supercomputer],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Ficsite_Trigon],
        quantityPerCycle: 15,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Excited_Photonic_Matter],
        quantityPerCycle: 25,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Neural_Quantum_Processor],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Dark_Matter_Residue],
        quantityPerCycle: 25,
      },
    ],
    initCycleDuration: 20,
  },
  // AI_Expansion_Server
  [RecipesEnum.AI_Expansion_Server]: {
    recipeName: RecipesEnum.AI_Expansion_Server,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Quantum_Encoder],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Magnetic_Field_Generator],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Neural_Quantum_Processor],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Superposition_Oscillator],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Excited_Photonic_Matter],
        quantityPerCycle: 25,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.AI_Expansion_Server],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Dark_Matter_Residue],
        quantityPerCycle: 25,
      },
    ],
    initCycleDuration: 15,
  },
  // Singularity_Cell
  [RecipesEnum.Singularity_Cell]: {
    recipeName: RecipesEnum.Singularity_Cell,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Nuclear_Pasta],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Dark_Matter_Crystal],
        quantityPerCycle: 20,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Plate],
        quantityPerCycle: 100,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Concrete],
        quantityPerCycle: 200,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Singularity_Cell],
        quantityPerCycle: 10,
      },
    ],
    initCycleDuration: 60,
  },
  // Ballistic_Warp_Drive
  [RecipesEnum.Ballistic_Warp_Drive]: {
    recipeName: RecipesEnum.Ballistic_Warp_Drive,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Thermal_Propulsion_Rocket],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Singularity_Cell],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Superposition_Oscillator],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Dark_Matter_Crystal],
        quantityPerCycle: 40,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Ballistic_Warp_Drive],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 60,
  },
  // Ficsonium
  [RecipesEnum.Ficsonium]: {
    recipeName: RecipesEnum.Ficsonium,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Particle_Accelerator],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Plutonium_Waste],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Singularity_Cell],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Dark_Matter_Residue],
        quantityPerCycle: 20,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Ficsonium],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 6,
  },
  // Ficsonium_Fuel_Rod
  [RecipesEnum.Ficsonium_Fuel_Rod]: {
    recipeName: RecipesEnum.Ficsonium_Fuel_Rod,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Quantum_Encoder],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Ficsonium],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Electromagnetic_Control_Rod],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Ficsite_Trigon],
        quantityPerCycle: 40,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Excited_Photonic_Matter],
        quantityPerCycle: 20,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Ficsonium_Fuel_Rod],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Dark_Matter_Residue],
        quantityPerCycle: 20,
      },
    ],
    initCycleDuration: 24,
  },

  // =========== MAM items ============
  // Power_Shard
  [RecipesEnum.Power_Shard_Blue_Power_Slug]: {
    recipeName: RecipesEnum.Power_Shard_Blue_Power_Slug,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Blue_Power_Slug],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Power_Shard],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 8,
  },
  [RecipesEnum.Power_Shard_Yellow_Power_Slug]: {
    recipeName: RecipesEnum.Power_Shard_Yellow_Power_Slug,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Yellow_Power_Slug],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Power_Shard],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 12,
  },
  [RecipesEnum.Power_Shard_Purple_Power_Slug]: {
    recipeName: RecipesEnum.Power_Shard_Purple_Power_Slug,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Purple_Power_Slug],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Power_Shard],
        quantityPerCycle: 5,
      },
    ],
    initCycleDuration: 24,
  },
  [RecipesEnum.Synthetic_Power_Shard]: {
    recipeName: RecipesEnum.Synthetic_Power_Shard,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Quantum_Encoder],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Time_Crystal],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Dark_Matter_Crystal],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Quartz_Crystal],
        quantityPerCycle: 12,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Excited_Photonic_Matter],
        quantityPerCycle: 12,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Power_Shard],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Dark_Matter_Residue],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 12,
  },
  // Alien_Protein
  [RecipesEnum.Alien_Protein_Spitter]: {
    recipeName: RecipesEnum.Alien_Protein_Spitter,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Spitter_Remains],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Alien_Protein],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 3,
  },
  [RecipesEnum.Alien_Protein_Hog]: {
    recipeName: RecipesEnum.Alien_Protein_Hog,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Hog_Remains],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Alien_Protein],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 3,
  },
  [RecipesEnum.Alien_Protein_Stinger]: {
    recipeName: RecipesEnum.Alien_Protein_Stinger,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Stinger_Remains],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Alien_Protein],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 3,
  },
  [RecipesEnum.Alien_Protein_Hatcher]: {
    recipeName: RecipesEnum.Alien_Protein_Hatcher,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Hatcher_Remains],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Alien_Protein],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 3,
  },
  // Alien_DNA_Capsule
  [RecipesEnum.Alien_DNA_Capsule]: {
    recipeName: RecipesEnum.Alien_DNA_Capsule,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Alien_Protein],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Alien_DNA_Capsule],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 6,
  },
  // Fabric
  [RecipesEnum.Fabric]: {
    recipeName: RecipesEnum.Fabric,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Mycelia],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Biomass],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Fabric],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 4,
  },
  [RecipesEnum.Alternate_Polyester_Fabric]: {
    recipeName: RecipesEnum.Alternate_Polyester_Fabric,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Polymer_Resin],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Fabric],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 2,
  },
  // Caterium_Ingot
  [RecipesEnum.Caterium_Ingot]: {
    recipeName: RecipesEnum.Caterium_Ingot,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Smelter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Caterium_Ore],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Caterium_Ingot],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 4,
  },
  [RecipesEnum.Alternate_Pure_Caterium_Ingot]: {
    recipeName: RecipesEnum.Alternate_Pure_Caterium_Ingot,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Caterium_Ore],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Caterium_Ingot],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 5,
  },
  [RecipesEnum.Alternate_Tempered_Caterium_Ingot]: {
    recipeName: RecipesEnum.Alternate_Tempered_Caterium_Ingot,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Foundry],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Caterium_Ore],
        quantityPerCycle: 6,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Petroleum_Coke],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Caterium_Ingot],
        quantityPerCycle: 3,
      },
    ],
    initCycleDuration: 8,
  },
  [RecipesEnum.Alternate_Leached_Caterium_Ingot]: {
    recipeName: RecipesEnum.Alternate_Leached_Caterium_Ingot,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Caterium_Ore],
        quantityPerCycle: 9,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfuric_Acid],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Caterium_Ingot],
        quantityPerCycle: 6,
      },
    ],
    initCycleDuration: 10,
  },
  // Quickwire
  [RecipesEnum.Quickwire]: {
    recipeName: RecipesEnum.Quickwire,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Caterium_Ingot],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Quickwire],
        quantityPerCycle: 5,
      },
    ],
    initCycleDuration: 5,
  },
  [RecipesEnum.Alternate_Fused_Quickwire]: {
    recipeName: RecipesEnum.Alternate_Fused_Quickwire,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Caterium_Ingot],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ingot],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Quickwire],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 8,
  },
  // AI_Limiter
  [RecipesEnum.AI_Limiter]: {
    recipeName: RecipesEnum.AI_Limiter,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Sheet],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Quickwire],
        quantityPerCycle: 20,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.AI_Limiter],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 12,
  },
  [RecipesEnum.Alternate_Plastic_AI_Limiter]: {
    recipeName: RecipesEnum.Alternate_Plastic_AI_Limiter,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Quickwire],
        quantityPerCycle: 30,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Plastic],
        quantityPerCycle: 7,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.AI_Limiter],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 15,
  },
  // High_Speed_Connector
  [RecipesEnum.High_Speed_Connector]: {
    recipeName: RecipesEnum.High_Speed_Connector,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Quickwire],
        quantityPerCycle: 56,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Cable],
        quantityPerCycle: 10,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Circuit_Board],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.High_Speed_Connector],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 16,
  },
  [RecipesEnum.Alternate_Silicon_High_Speed_Connector]: {
    recipeName: RecipesEnum.Alternate_Silicon_High_Speed_Connector,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Quickwire],
        quantityPerCycle: 60,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Silica],
        quantityPerCycle: 25,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Circuit_Board],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.High_Speed_Connector],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 40,
  },
  // Quartz_Crystal
  [RecipesEnum.Quartz_Crystal]: {
    recipeName: RecipesEnum.Quartz_Crystal,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Raw_Quartz],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Quartz_Crystal],
        quantityPerCycle: 3,
      },
    ],
    initCycleDuration: 8,
  },
  [RecipesEnum.Alternate_Pure_Quartz_Crystal]: {
    recipeName: RecipesEnum.Alternate_Pure_Quartz_Crystal,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Raw_Quartz],
        quantityPerCycle: 9,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Quartz_Crystal],
        quantityPerCycle: 7,
      },
    ],
    initCycleDuration: 8,
  },
  [RecipesEnum.Alternate_Fused_Quartz_Crystal]: {
    recipeName: RecipesEnum.Alternate_Fused_Quartz_Crystal,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Foundry],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Raw_Quartz],
        quantityPerCycle: 25,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Coal],
        quantityPerCycle: 12,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Quartz_Crystal],
        quantityPerCycle: 18,
      },
    ],
    initCycleDuration: 20,
  },
  // Silica
  [RecipesEnum.Silica]: {
    recipeName: RecipesEnum.Silica,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Raw_Quartz],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Silica],
        quantityPerCycle: 5,
      },
    ],
    initCycleDuration: 8,
  },
  [RecipesEnum.Alternate_Cheap_Silica]: {
    recipeName: RecipesEnum.Alternate_Cheap_Silica,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Raw_Quartz],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Limestone],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Silica],
        quantityPerCycle: 7,
      },
    ],
    initCycleDuration: 8,
  },
  [RecipesEnum.Alternate_Distilled_Silica]: {
    recipeName: RecipesEnum.Alternate_Distilled_Silica,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Blender],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Dissolved_Silica],
        quantityPerCycle: 12,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Limestone],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 10,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Silica],
        quantityPerCycle: 27,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 8,
      },
    ],
    initCycleDuration: 6,
  },
  // Crystal_Oscillator
  [RecipesEnum.Crystal_Oscillator]: {
    recipeName: RecipesEnum.Crystal_Oscillator,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Quartz_Crystal],
        quantityPerCycle: 36,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Cable],
        quantityPerCycle: 28,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Reinforced_Iron_Plate],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Crystal_Oscillator],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 120,
  },
  [RecipesEnum.Alternate_Insulated_Crystal_Oscillator]: {
    recipeName: RecipesEnum.Alternate_Insulated_Crystal_Oscillator,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Quartz_Crystal],
        quantityPerCycle: 10,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Rubber],
        quantityPerCycle: 7,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.AI_Limiter],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Crystal_Oscillator],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 32,
  },
  // Dissolved_Silica
  [RecipesEnum.Alternate_Quartz_Purification]: {
    recipeName: RecipesEnum.Alternate_Quartz_Purification,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Raw_Quartz],
        quantityPerCycle: 24,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Nitric_Acid],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Quartz_Crystal],
        quantityPerCycle: 15,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Dissolved_Silica],
        quantityPerCycle: 12,
      },
    ],
    initCycleDuration: 12,
  },
  // Black_Powder
  [RecipesEnum.Black_Powder]: {
    recipeName: RecipesEnum.Black_Powder,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Coal],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfur],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Black_Powder],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 4,
  },
  [RecipesEnum.Alternate_Fine_Black_Powder]: {
    recipeName: RecipesEnum.Alternate_Fine_Black_Powder,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfur],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Compacted_Coal],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Black_Powder],
        quantityPerCycle: 6,
      },
    ],
    initCycleDuration: 8,
  },
  // Compacted_Coal
  [RecipesEnum.Alternate_Compacted_Coal]: {
    recipeName: RecipesEnum.Alternate_Compacted_Coal,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Coal],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfur],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Compacted_Coal],
        quantityPerCycle: 5,
      },
    ],
    initCycleDuration: 12,
  },
  // Turbofuel
  [RecipesEnum.Turbofuel]: {
    recipeName: RecipesEnum.Turbofuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Fuel],
        quantityPerCycle: 6,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Compacted_Coal],
        quantityPerCycle: 4,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Turbofuel],
        quantityPerCycle: 5,
      },
    ],
    initCycleDuration: 16,
  },
  [RecipesEnum.Unpackage_Turbofuel]: {
    recipeName: RecipesEnum.Unpackage_Turbofuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Turbofuel],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Turbofuel],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Canister],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Alternate_Turbo_Heavy_Fuel]: {
    recipeName: RecipesEnum.Alternate_Turbo_Heavy_Fuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Heavy_Oil_Residue],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Compacted_Coal],
        quantityPerCycle: 4,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Turbofuel],
        quantityPerCycle: 4,
      },
    ],
    initCycleDuration: 8,
  },
  [RecipesEnum.Alternate_Turbo_Blend_Fuel]: {
    recipeName: RecipesEnum.Alternate_Turbo_Blend_Fuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Blender],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Fuel],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Heavy_Oil_Residue],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfur],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Petroleum_Coke],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Turbofuel],
        quantityPerCycle: 6,
      },
    ],
    initCycleDuration: 8,
  },
  // Packaged_Turbofuel
  [RecipesEnum.Packaged_Turbofuel]: {
    recipeName: RecipesEnum.Packaged_Turbofuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Turbofuel],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Canister],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Turbofuel],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 6,
  },
  // Smokeless_Powder
  [RecipesEnum.Smokeless_Powder]: {
    recipeName: RecipesEnum.Smokeless_Powder,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Black_Powder],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Heavy_Oil_Residue],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Smokeless_Powder],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 6,
  },
  // Rocket_Fuel
  [RecipesEnum.Rocket_Fuel]: {
    recipeName: RecipesEnum.Rocket_Fuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Blender],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Turbofuel],
        quantityPerCycle: 6,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Nitric_Acid],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Rocket_Fuel],
        quantityPerCycle: 10,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Compacted_Coal],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Unpackage_Rocket_Fuel]: {
    recipeName: RecipesEnum.Unpackage_Rocket_Fuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Rocket_Fuel],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Rocket_Fuel],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Fluid_Tank],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 1,
  },
  [RecipesEnum.Alternate_Nitro_Rocket_Fuel]: {
    recipeName: RecipesEnum.Alternate_Nitro_Rocket_Fuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Blender],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Fuel],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Nitrogen_Gas],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Sulfur],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Coal],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Rocket_Fuel],
        quantityPerCycle: 6,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Compacted_Coal],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 2.4,
  },
  // Packaged_Rocket_Fuel
  [RecipesEnum.Packaged_Rocket_Fuel]: {
    recipeName: RecipesEnum.Packaged_Rocket_Fuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Rocket_Fuel],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Fluid_Tank],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Rocket_Fuel],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 1,
  },
  // Ionized_Fuel
  [RecipesEnum.Ionized_Fuel]: {
    recipeName: RecipesEnum.Ionized_Fuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Refinery],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Rocket_Fuel],
        quantityPerCycle: 16,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Power_Shard],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Ionized_Fuel],
        quantityPerCycle: 16,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Compacted_Coal],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 24,
  },
  [RecipesEnum.Unpackage_Ionized_Fuel]: {
    recipeName: RecipesEnum.Unpackage_Ionized_Fuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Ionized_Fuel],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Ionized_Fuel],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Fluid_Tank],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 3,
  },
  [RecipesEnum.Alternate_Dark_Ion_Fuel]: {
    recipeName: RecipesEnum.Alternate_Dark_Ion_Fuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Converter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Rocket_Fuel],
        quantityPerCycle: 12,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Dark_Matter_Crystal],
        quantityPerCycle: 4,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Ionized_Fuel],
        quantityPerCycle: 10,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Compacted_Coal],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 3,
  },
  // Packaged_Ionized_Fuel
  [RecipesEnum.Packaged_Ionized_Fuel]: {
    recipeName: RecipesEnum.Packaged_Ionized_Fuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Packager],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Ionized_Fuel],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Empty_Fluid_Tank],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Ionized_Fuel],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 3,
  },
  // Reanimated_SAM
  [RecipesEnum.Reanimated_SAM]: {
    recipeName: RecipesEnum.Reanimated_SAM,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.SAM],
        quantityPerCycle: 4,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 2,
  },
  // SAM_Fluctuator
  [RecipesEnum.SAM_Fluctuator]: {
    recipeName: RecipesEnum.SAM_Fluctuator,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Reanimated_SAM],
        quantityPerCycle: 6,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Wire],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Pipe],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.SAM_Fluctuator],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 6,
  },
  // Alien_Power_Matrix
  [RecipesEnum.Alien_Power_Matrix]: {
    recipeName: RecipesEnum.Alien_Power_Matrix,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Quantum_Encoder],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.SAM_Fluctuator],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Power_Shard],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Superposition_Oscillator],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Excited_Photonic_Matter],
        quantityPerCycle: 24,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Alien_Power_Matrix],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Dark_Matter_Residue],
        quantityPerCycle: 24,
      },
    ],
    initCycleDuration: 24,
  },

  // = Classic Automatable equipments =
  // Portable_Miner
  [RecipesEnum.Alternate_Automated_Miner]: {
    recipeName: RecipesEnum.Alternate_Automated_Miner,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Pipe],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Plate],
        quantityPerCycle: 4,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Portable_Miner],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 60,
  },
  // Gas_Filter
  [RecipesEnum.Gas_Filter]: {
    recipeName: RecipesEnum.Gas_Filter,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Fabric],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Coal],
        quantityPerCycle: 4,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Plate],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Gas_Filter],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 8,
  },
  // Iodine_Infused_Filter
  [RecipesEnum.Iodine_Infused_Filter]: {
    recipeName: RecipesEnum.Iodine_Infused_Filter,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Gas_Filter],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Quickwire],
        quantityPerCycle: 8,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Casing],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iodine_Infused_Filter],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 16,
  },

  // === MAM Automatable equipments ===
  // Iron_Rebar
  [RecipesEnum.Iron_Rebar]: {
    recipeName: RecipesEnum.Iron_Rebar,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Rod],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Rebar],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 4,
  },
  // Stun_Rebar
  [RecipesEnum.Stun_Rebar]: {
    recipeName: RecipesEnum.Stun_Rebar,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Rebar],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Quickwire],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Stun_Rebar],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 6,
  },
  // Shatter_Rebar
  [RecipesEnum.Shatter_Rebar]: {
    recipeName: RecipesEnum.Shatter_Rebar,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Rebar],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Quartz_Crystal],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Shatter_Rebar],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 12,
  },
  // Explosive_Rebar
  [RecipesEnum.Explosive_Rebar]: {
    recipeName: RecipesEnum.Explosive_Rebar,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Rebar],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Smokeless_Powder],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Pipe],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Explosive_Rebar],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 12,
  },
  // Nobelisk
  [RecipesEnum.Nobelisk]: {
    recipeName: RecipesEnum.Nobelisk,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Black_Powder],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Steel_Pipe],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Nobelisk],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 6,
  },
  // Gas_Nobelisk
  [RecipesEnum.Gas_Nobelisk]: {
    recipeName: RecipesEnum.Gas_Nobelisk,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Nobelisk],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Biomass],
        quantityPerCycle: 10,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Gas_Nobelisk],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 12,
  },
  // Pulse_Nobelisk
  [RecipesEnum.Pulse_Nobelisk]: {
    recipeName: RecipesEnum.Pulse_Nobelisk,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Nobelisk],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Crystal_Oscillator],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Pulse_Nobelisk],
        quantityPerCycle: 5,
      },
    ],
    initCycleDuration: 60,
  },
  // Cluster_Nobelisk
  [RecipesEnum.Cluster_Nobelisk]: {
    recipeName: RecipesEnum.Cluster_Nobelisk,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Nobelisk],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Smokeless_Powder],
        quantityPerCycle: 4,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Cluster_Nobelisk],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 24,
  },
  // Nuke_Nobelisk
  [RecipesEnum.Nuke_Nobelisk]: {
    recipeName: RecipesEnum.Nuke_Nobelisk,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Nobelisk],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Encased_Uranium_Cell],
        quantityPerCycle: 20,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Smokeless_Powder],
        quantityPerCycle: 10,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.AI_Limiter],
        quantityPerCycle: 6,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Nuke_Nobelisk],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 120,
  },
  // Rifle_Ammo
  [RecipesEnum.Rifle_Ammo]: {
    recipeName: RecipesEnum.Rifle_Ammo,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Sheet],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Smokeless_Powder],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Rifle_Ammo],
        quantityPerCycle: 15,
      },
    ],
    initCycleDuration: 12,
  },
  // Homing_Rifle_Ammo
  [RecipesEnum.Homing_Rifle_Ammo]: {
    recipeName: RecipesEnum.Homing_Rifle_Ammo,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Rifle_Ammo],
        quantityPerCycle: 20,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.High_Speed_Connector],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Homing_Rifle_Ammo],
        quantityPerCycle: 10,
      },
    ],
    initCycleDuration: 24,
  },
  // Turbo_Rifle_Ammo
  [RecipesEnum.Turbo_Rifle_Ammo]: {
    recipeName: RecipesEnum.Turbo_Rifle_Ammo,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Blender],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Rifle_Ammo],
        quantityPerCycle: 25,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Casing],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Turbofuel],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Turbo_Rifle_Ammo],
        quantityPerCycle: 50,
      },
    ],
    initCycleDuration: 12,
  },
  [RecipesEnum.Packaged_Turbo_Rifle_Ammo]: {
    recipeName: RecipesEnum.Packaged_Turbo_Rifle_Ammo,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Manufacturer],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Rifle_Ammo],
        quantityPerCycle: 25,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Aluminum_Casing],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Turbofuel],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Turbo_Rifle_Ammo],
        quantityPerCycle: 50,
      },
    ],
    initCycleDuration: 12,
  },

  // ======= Generators recipes =======
  // Biomass_Burner 30 Mw
  [RecipesEnum.Biomass_Burner_Leaves]: {
    recipeName: RecipesEnum.Biomass_Burner_Leaves,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Biomass_Burner],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Leaves],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Power],
        quantityPerCycle: 30,
      },
    ],
    initCycleDuration: 0.5,
  },
  [RecipesEnum.Biomass_Burner_Mycelia]: {
    recipeName: RecipesEnum.Biomass_Burner_Mycelia,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Biomass_Burner],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Mycelia],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Power],
        quantityPerCycle: 30,
      },
    ],
    initCycleDuration: 2 / 3,
  },
  [RecipesEnum.Biomass_Burner_Wood]: {
    recipeName: RecipesEnum.Biomass_Burner_Wood,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Biomass_Burner],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Wood],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Power],
        quantityPerCycle: 30,
      },
    ],
    initCycleDuration: 10 / 3,
  },
  [RecipesEnum.Biomass_Burner_Biomass]: {
    recipeName: RecipesEnum.Biomass_Burner_Biomass,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Biomass_Burner],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Biomass],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Power],
        quantityPerCycle: 30,
      },
    ],
    initCycleDuration: 6,
  },
  [RecipesEnum.Biomass_Burner_Solid_Biofuel]: {
    recipeName: RecipesEnum.Biomass_Burner_Solid_Biofuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Biomass_Burner],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Solid_Biofuel],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Power],
        quantityPerCycle: 30,
      },
    ],
    initCycleDuration: 15,
  },
  [RecipesEnum.Biomass_Burner_Packaged_Liquid_Biofuel]: {
    recipeName: RecipesEnum.Biomass_Burner_Packaged_Liquid_Biofuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Biomass_Burner],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Packaged_Liquid_Biofuel],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Power],
        quantityPerCycle: 30,
      },
    ],
    initCycleDuration: 25,
  },
  // Coal_Powered_Generator 75 Mw
  [RecipesEnum.Coal_Powered_Generator_Coal]: {
    recipeName: RecipesEnum.Coal_Powered_Generator_Coal,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Coal_Powered_Generator],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Coal],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Power],
        quantityPerCycle: 75,
      },
    ],
    initCycleDuration: 4,
  },
  [RecipesEnum.Coal_Powered_Generator_Compacted_Coal]: {
    recipeName: RecipesEnum.Coal_Powered_Generator_Compacted_Coal,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Coal_Powered_Generator],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Compacted_Coal],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 6.3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Power],
        quantityPerCycle: 75,
      },
    ],
    initCycleDuration: 8.4,
  },
  [RecipesEnum.Coal_Powered_Generator_Petroleum_Coke]: {
    recipeName: RecipesEnum.Coal_Powered_Generator_Petroleum_Coke,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Coal_Powered_Generator],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Petroleum_Coke],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 1.8,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Power],
        quantityPerCycle: 75,
      },
    ],
    initCycleDuration: 2.4,
  },
  // Fuel_Powered_Generator 250 Mw
  [RecipesEnum.Fuel_Powered_Generator_Fuel]: {
    recipeName: RecipesEnum.Fuel_Powered_Generator_Fuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Fuel_Powered_Generator],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Fuel],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Power],
        quantityPerCycle: 250,
      },
    ],
    initCycleDuration: 3,
  },
  [RecipesEnum.Fuel_Powered_Generator_Liquid_Biofuel]: {
    recipeName: RecipesEnum.Fuel_Powered_Generator_Liquid_Biofuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Fuel_Powered_Generator],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Liquid_Biofuel],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Power],
        quantityPerCycle: 250,
      },
    ],
    initCycleDuration: 3,
  },
  [RecipesEnum.Fuel_Powered_Generator_Turbofuel]: {
    recipeName: RecipesEnum.Fuel_Powered_Generator_Turbofuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Fuel_Powered_Generator],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Turbofuel],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Power],
        quantityPerCycle: 250,
      },
    ],
    initCycleDuration: 8,
  },
  [RecipesEnum.Fuel_Powered_Generator_Rocket_Fuel]: {
    recipeName: RecipesEnum.Fuel_Powered_Generator_Rocket_Fuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Fuel_Powered_Generator],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Rocket_Fuel],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Power],
        quantityPerCycle: 250,
      },
    ],
    initCycleDuration: 14.4,
  },
  [RecipesEnum.Fuel_Powered_Generator_Ionized_Fuel]: {
    recipeName: RecipesEnum.Fuel_Powered_Generator_Ionized_Fuel,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Fuel_Powered_Generator],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Ionized_Fuel],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Power],
        quantityPerCycle: 250,
      },
    ],
    initCycleDuration: 20,
  },
  // Nuclear_Power_Plant 2 500 Mw
  [RecipesEnum.Nuclear_Power_Plant_Uranium_Fuel_Rod]: {
    recipeName: RecipesEnum.Nuclear_Power_Plant_Uranium_Fuel_Rod,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Nuclear_Power_Plant],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Uranium_Fuel_Rod],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 1200,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Power],
        quantityPerCycle: 2500,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Uranium_Waste],
        quantityPerCycle: 50,
      },
    ],
    initCycleDuration: 300,
  },
  [RecipesEnum.Nuclear_Power_Plant_Plutonium_Fuel_Rod]: {
    recipeName: RecipesEnum.Nuclear_Power_Plant_Plutonium_Fuel_Rod,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Nuclear_Power_Plant],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Plutonium_Fuel_Rod],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 2400,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Power],
        quantityPerCycle: 2500,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Plutonium_Waste],
        quantityPerCycle: 10,
      },
    ],
    initCycleDuration: 600,
  },
  [RecipesEnum.Nuclear_Power_Plant_Ficsonium_Fuel_Rod]: {
    recipeName: RecipesEnum.Nuclear_Power_Plant_Ficsonium_Fuel_Rod,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Nuclear_Power_Plant],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Ficsonium_Fuel_Rod],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Water],
        quantityPerCycle: 240,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Power],
        quantityPerCycle: 2500,
      },
    ],
    initCycleDuration: 60,
  },

  // ========= FICSMAS items ==========
  // FICSMAS_Tree_Branch
  [RecipesEnum.FICSMAS_Tree_Branch]: {
    recipeName: RecipesEnum.FICSMAS_Tree_Branch,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.FICSMAS_Gift],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.FICSMAS_Tree_Branch],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 6,
  },
  // Red_FICSMAS_Ornament
  [RecipesEnum.Red_FICSMAS_Ornament]: {
    recipeName: RecipesEnum.Red_FICSMAS_Ornament,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Smelter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.FICSMAS_Gift],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Red_FICSMAS_Ornament],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 12,
  },
  // Blue_FICSMAS_Ornament
  [RecipesEnum.Blue_FICSMAS_Ornament]: {
    recipeName: RecipesEnum.Blue_FICSMAS_Ornament,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Smelter],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.FICSMAS_Gift],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Blue_FICSMAS_Ornament],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 12,
  },
  // Copper_FICSMAS_Ornament
  [RecipesEnum.Copper_FICSMAS_Ornament]: {
    recipeName: RecipesEnum.Copper_FICSMAS_Ornament,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Foundry],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Red_FICSMAS_Ornament],
        quantityPerCycle: 2,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_Ingot],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_FICSMAS_Ornament],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 12,
  },
  // Iron_FICSMAS_Ornament
  [RecipesEnum.Iron_FICSMAS_Ornament]: {
    recipeName: RecipesEnum.Iron_FICSMAS_Ornament,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Foundry],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Blue_FICSMAS_Ornament],
        quantityPerCycle: 3,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_Ingot],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_FICSMAS_Ornament],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 12,
  },
  // FICSMAS_Wreath
  [RecipesEnum.FICSMAS_Wreath]: {
    recipeName: RecipesEnum.FICSMAS_Wreath,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.FICSMAS_Tree_Branch],
        quantityPerCycle: 15,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.FICSMAS_Ornament_Bundle],
        quantityPerCycle: 6,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.FICSMAS_Wreath],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 60,
  },
  // FICSMAS_Ornament_Bundle
  [RecipesEnum.FICSMAS_Ornament_Bundle]: {
    recipeName: RecipesEnum.FICSMAS_Ornament_Bundle,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Copper_FICSMAS_Ornament],
        quantityPerCycle: 1,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Iron_FICSMAS_Ornament],
        quantityPerCycle: 1,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.FICSMAS_Ornament_Bundle],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 12,
  },
  // Candy_Cane
  [RecipesEnum.Candy_Cane]: {
    recipeName: RecipesEnum.Candy_Cane,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.FICSMAS_Gift],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Candy_Cane],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 12,
  },
  // FICSMAS_Bow
  [RecipesEnum.FICSMAS_Bow]: {
    recipeName: RecipesEnum.FICSMAS_Bow,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.FICSMAS_Gift],
        quantityPerCycle: 2,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.FICSMAS_Bow],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 12,
  },
  // FICSMAS_Actual_Snow
  [RecipesEnum.FICSMAS_Actual_Snow]: {
    recipeName: RecipesEnum.FICSMAS_Actual_Snow,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.FICSMAS_Gift],
        quantityPerCycle: 5,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.FICSMAS_Actual_Snow],
        quantityPerCycle: 2,
      },
    ],
    initCycleDuration: 12,
  },
  // FICSMAS_Wonder_Star
  [RecipesEnum.FICSMAS_Wonder_Star]: {
    recipeName: RecipesEnum.FICSMAS_Wonder_Star,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Assembler],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.FICSMAS_Wreath],
        quantityPerCycle: 5,
      },
      {
        item: gameItemsDictionnary[GameItemsEnum.Candy_Cane],
        quantityPerCycle: 20,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.FICSMAS_Wonder_Star],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 60,
  },
  // Snowball
  [RecipesEnum.Snowball]: {
    recipeName: RecipesEnum.Snowball,
    craftBuildings: gameItemsDictionnary[GameItemsEnum.Constructor],
    itemsIn: [
      {
        item: gameItemsDictionnary[GameItemsEnum.FICSMAS_Actual_Snow],
        quantityPerCycle: 3,
      },
    ],
    itemsOut: [
      {
        item: gameItemsDictionnary[GameItemsEnum.Snowball],
        quantityPerCycle: 1,
      },
    ],
    initCycleDuration: 12,
  },
};
