import { IconContainer, IconTokenEnum } from "@nexus/nexusExporter";
import React from "react";

import { GraphFactoryLineDirectionEnum as GraphDirection } from "../../../enums/graphFactoryLineDirection.enum";
import { GraphFactoryLineSizeEnum as GraphSize } from "../../../enums/graphFactoryLineSize.enum";
import { stringRemoveEndPxHelper } from "../../../helpers/stringRemoveEndPx.helper";
import { theme } from "../../../styles/theme";
import styles from "./styles.module.scss";

type PropsType = {
  graphSize: GraphSize;
  setGraphSize: (newSize: GraphSize) => void;
  graphDirection: GraphDirection;
  setGraphDirection: (newSize: GraphDirection) => void;
};

export const GraphHandlerButtons = ({
  graphSize,
  setGraphSize,
  graphDirection,
  setGraphDirection,
}: PropsType): React.JSX.Element | null => {
  const setNewGraphSize = () => {
    setGraphSize(
      graphSize === GraphSize.NORMAL ? GraphSize.FULLSCREEN : GraphSize.NORMAL,
    );
  };

  const setNewGraphDirection = () => {
    switch (graphDirection) {
      case GraphDirection.LEFT_TO_RIGHT:
        setGraphDirection(GraphDirection.TOP_TO_BOTTOM);
        break;
      case GraphDirection.TOP_TO_BOTTOM:
        setGraphDirection(GraphDirection.RIGHT_TO_LEFT);
        break;
      case GraphDirection.RIGHT_TO_LEFT:
        setGraphDirection(GraphDirection.BOTTOM_TO_TOP);
        break;
      case GraphDirection.BOTTOM_TO_TOP:
        setGraphDirection(GraphDirection.LEFT_TO_RIGHT);
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.graph_button_container}>
      <button
        aria-label="fullscreen graph button"
        type="button"
        onClick={setNewGraphSize}
      >
        <IconContainer
          size={2 * stringRemoveEndPxHelper(theme.spaceXL)}
          iconToken={
            graphSize === GraphSize.FULLSCREEN
              ? IconTokenEnum.Collapse
              : IconTokenEnum.Expand
          }
          color={theme.colorSecondaryContent}
        />
      </button>
      <button
        aria-label="fullscreen graph button"
        type="button"
        onClick={setNewGraphDirection}
      >
        <div
          className={styles.arrow_button_rotator_container}
          data-direction={graphDirection}
        >
          <IconContainer
            size={2 * stringRemoveEndPxHelper(theme.spaceXL)}
            iconToken={IconTokenEnum.Arrow}
            color={theme.colorSecondaryContent}
          />
        </div>
      </button>
    </div>
  );
};
