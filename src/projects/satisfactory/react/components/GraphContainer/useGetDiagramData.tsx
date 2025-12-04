import { getTextSizeHelper, roundNumber } from "@nexus/nexusExporter";
import type { Edge, Node } from "vis-network";

import { TranslationsFilesEnum as TF } from "../../../enums/translationsFile.enum";
import { stringRemoveEndPxHelper } from "../../../helpers/stringRemoveEndPx.helper";
import { theme } from "../../../styles/theme";
import type { FactoryLine } from "../../../types/satisfactory/factoryLine.type";
import { useCustomTranslations } from "../../hooks/useCustomTranslations";

type PropsType = {
  factoryLine: FactoryLine | null;
  graphHorizontalSpacing: number;
  setGraphHorizontalSpacing: (newValue: number) => void;
};

export const useGetDiagramData = ({
  factoryLine,
  graphHorizontalSpacing,
  setGraphHorizontalSpacing,
}: PropsType) => {
  const t = useCustomTranslations();

  const horizontalGraphSpacingHandler = (label: string) => {
    const labelSize = getTextSizeHelper(
      label,
      stringRemoveEndPxHelper(theme.spaceXL),
      theme.primaryFontFamily,
      "bold",
    );
    if (labelSize > graphHorizontalSpacing) {
      setGraphHorizontalSpacing(labelSize);
    }
  };

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const getNodeLabel = (node: FactoryLine) => {
    return `<b>${t(TF.SATISFACTORY_RECIPES, node.recipe.recipeName)}</b>\n${node.buildingNumber}x ${t(TF.SATISFACTORY_ITEMS, node.recipe.craftBuildings.name)} ${t(TF.COMMON, "at")} ${node.overclocking}%\n${roundNumber(node.powerRequired, 1)} Mw | ${roundNumber(node.energyRequired, 1)} Mj ${t(TF.COMMON, "energyPerItem")}`;
  };

  if (factoryLine) {
    const pusher = (nodeElement: FactoryLine) => {
      nodes.push({
        id: nodeElement.id,
        label: getNodeLabel(nodeElement),
      });
      if (nodeElement.parents.length) {
        nodeElement.parents.forEach((parent) => {
          const currentInItems = nodeElement.recipe.itemsIn;
          const parentOutItems = parent.recipe.itemsOut;
          const commonItems = currentInItems.filter((item) =>
            parentOutItems.some((itemOut) => itemOut.item === item.item),
          );

          const edgeLabel = `${t(TF.SATISFACTORY_ITEMS, commonItems[0].item.name)}\n${roundNumber(parent?.quantityPerMinute ?? 0, 2)} / min `;
          horizontalGraphSpacingHandler(edgeLabel);
          edges.push({
            from: parent.id,
            to: nodeElement.id,
            label: edgeLabel,
          });
          pusher(parent);
        });
      } else {
        nodeElement.rawResources!.forEach((itemIn) => {
          const getRawResourceLabel = (bold: boolean) => {
            const firstPart = t(TF.SATISFACTORY_ITEMS, itemIn.item.name);
            const secondPart = `${roundNumber(itemIn.quantityPerMinute, 2)} / min`;
            return bold
              ? `<b>${firstPart}</b>\n${secondPart}`
              : `${firstPart}\n${secondPart}`;
          };

          const itemInId = crypto.randomUUID();
          nodes.push({
            id: itemInId,
            label: getRawResourceLabel(true),
            color: theme.colorAccentLight,
            margin: {
              bottom: stringRemoveEndPxHelper(theme.spaceM),
              left: stringRemoveEndPxHelper(theme.spaceXL),
              right: stringRemoveEndPxHelper(theme.spaceXL),
              top: stringRemoveEndPxHelper(theme.spaceM),
            },
          });
          horizontalGraphSpacingHandler(getRawResourceLabel(true));
          edges.push({
            from: itemInId,
            to: nodeElement.id,
            label: getRawResourceLabel(false),
          });
        });
      }
    };

    pusher(factoryLine);
  }

  return { nodes, edges };
};
