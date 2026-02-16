import type React from "react";

import { Arrow } from "./icons/Arrow";
import { Collapse } from "./icons/Collapse";
import { DropdownArrow } from "./icons/DropdownArrow";
import { Expand } from "./icons/Expand";
import { TriangleArrow } from "./icons/TriangleArrow";
import { IconTokenEnum } from "./iconToken.enum";

export const IconsList: Record<
	IconTokenEnum,
	React.JSXElementConstructor<{ styles: React.CSSProperties }>
> = {
	[IconTokenEnum.Arrow]: Arrow,
	[IconTokenEnum.Collapse]: Collapse,
	[IconTokenEnum.DropdownArrow]: DropdownArrow,
	[IconTokenEnum.Expand]: Expand,
	[IconTokenEnum.TriangleArrow]: TriangleArrow,
};
