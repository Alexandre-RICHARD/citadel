import React from "react";

import { GraphFactoryLineDirectionEnum as GraphDirection } from "../../../enums/graphFactoryLineDirection.enum";
import { GraphFactoryLineSizeEnum as GraphSize } from "../../../enums/graphFactoryLineSize.enum";
import { stringRemoveEndPxHelper } from "../../../helpers/stringRemoveEndPx.helper";
import { IconTokenEnum } from "../../../nexus/enums/iconToken.enum";
import { IconContainer } from "../../../nexus/react/components/IconContainer";
import styles from "./styles.module.scss";

type PropsType = {
	graphSize: GraphSize;
	setGraphSize: (newSize: GraphSize) => void;
	graphDirection: GraphDirection;
	setGraphDirection: (newSize: GraphDirection) => void;
};

export function GraphHandlerButtons({
	graphSize,
	setGraphSize,
	graphDirection,
	setGraphDirection,
}: PropsType): React.JSX.Element | null {
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
				className={styles.graph_button}
				aria-label="fullscreen graph button"
				type="button"
				onClick={setNewGraphSize}
			>
				<IconContainer
					size={2 * stringRemoveEndPxHelper("20px")}
					iconToken={
						graphSize === GraphSize.FULLSCREEN
							? IconTokenEnum.Collapse
							: IconTokenEnum.Expand
					}
					color="#eeeeee"
				/>
			</button>
			<button
				className={styles.graph_button}
				aria-label="fullscreen graph button"
				type="button"
				onClick={setNewGraphDirection}
			>
				<div
					className={styles.arrow_button_rotator_container}
					data-direction={graphDirection}
				>
					<IconContainer
						size={2 * stringRemoveEndPxHelper("20px")}
						iconToken={IconTokenEnum.Arrow}
						color="#eeeeee"
					/>
				</div>
			</button>
		</div>
	);
}
