import type { Options } from "vis-network";

import { GraphFactoryLineDirectionEnum as GraphDirection } from "../../../enums/graphFactoryLineDirection.enum";
import { stringRemoveEndPxHelper } from "../../../helpers/stringRemoveEndPx.helper";

type PropsType = {
	graphDirection: GraphDirection;
	graphHorizontalSpacing: number;
};

// TODO T => Ajouter produit brutes et finis + Consommation totale de ressource et d'énergie
export const useGetDiagramOptions = ({
	graphDirection,
	graphHorizontalSpacing,
}: PropsType): Options => {
	const isGraphVertical = [
		GraphDirection.BOTTOM_TO_TOP,
		GraphDirection.TOP_TO_BOTTOM,
	].includes(graphDirection);

	return {
		autoResize: true,
		// height,
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
			color: "#fa9549",
			shape: "box",
			borderWidth: 0,
			chosen: false,
			font: {
				color: "#222222",
				size: stringRemoveEndPxHelper("16px"),
				multi: true,
				bold: { size: stringRemoveEndPxHelper("24px") },
			},
			margin: {
				bottom: stringRemoveEndPxHelper("12px"),
				left: stringRemoveEndPxHelper("12px"),
				right: stringRemoveEndPxHelper("12px"),
				top: stringRemoveEndPxHelper("12px"),
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
			color: "#dadad7",
			font: {
				align: "horizontal",
				strokeWidth: 0,
				color: "#eeeeee",
				size: stringRemoveEndPxHelper("20px"),
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
