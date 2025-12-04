import { useEffect, useState } from "react";
import type { Options } from "vis-network";

import { GraphFactoryLineDirectionEnum as GraphDirection } from "../../../enums/graphFactoryLineDirection.enum";
import { GraphFactoryLineSizeEnum as GraphSize } from "../../../enums/graphFactoryLineSize.enum";
import { stringRemoveEndPxHelper } from "../../../helpers/stringRemoveEndPx.helper";
import { theme } from "../../../styles/theme";

type PropsType = {
  graphSize: GraphSize;
  graphDirection: GraphDirection;
  graphContainer: React.RefObject<HTMLDivElement | null>;
  graphHorizontalSpacing: number;
};

// TODO T => Ajouter produit brutes et finis + Consommation totale de ressource et d'énergie
export const useGetDiagramOptions = ({
  graphSize,
  graphDirection,
  graphContainer,
  graphHorizontalSpacing,
}: PropsType): Options => {
  const [distanceToBottom, setDistanceToBottom] = useState(0);
  const height =
    graphSize === GraphSize.NORMAL
      ? `${distanceToBottom - stringRemoveEndPxHelper(theme.spaceS)}px`
      : `${window.innerHeight}px`;

  useEffect(() => {
    const updateDistance = () => {
      if (graphContainer.current) {
        const rect = graphContainer.current.getBoundingClientRect();
        const distance = window.innerHeight - rect.top;
        setDistanceToBottom(distance);
      } else {
        setTimeout(updateDistance, 10);
      }
    };

    updateDistance();
    window.addEventListener("resize", updateDistance);
    return () => window.removeEventListener("resize", updateDistance);
  }, [graphContainer]);

  const isGraphVertical = [
    GraphDirection.BOTTOM_TO_TOP,
    GraphDirection.TOP_TO_BOTTOM,
  ].includes(graphDirection);

  return {
    autoResize: true,
    height,
    width: "100%",
    layout: {
      hierarchical: {
        direction: graphDirection,
        sortMethod: "directed",
        levelSeparation: isGraphVertical ? 180 : graphHorizontalSpacing * 1.55,
        nodeSpacing: isGraphVertical ? 400 : 120,
      },
    },
    nodes: {
      color: theme.colorPrimaryHue,
      shape: "box",
      borderWidth: 0,
      chosen: false,
      font: {
        color: theme.colorBlack,
        size: stringRemoveEndPxHelper(theme.sizeL),
        multi: true,
        bold: { size: stringRemoveEndPxHelper(theme.sizeXL) },
      },
      margin: {
        bottom: stringRemoveEndPxHelper(theme.spaceXS),
        left: stringRemoveEndPxHelper(theme.spaceM),
        right: stringRemoveEndPxHelper(theme.spaceM),
        top: stringRemoveEndPxHelper(theme.spaceXS),
      },
      physics: false,
    },
    edges: {
      arrows: {
        to: {
          enabled: true,
        },
      },
      chosen: false,
      color: theme.colorNeutralLight,
      font: {
        align: "horizontal",
        strokeWidth: 0,
        color: theme.colorPrimaryContent,
        size: stringRemoveEndPxHelper(theme.spaceXL),
      },
      shadow: false,
      smooth: false,
      labelHighlightBold: false,
    },
    interaction: {
      tooltipDelay: 0,
    },
    physics: false,
  };
};
