import type { CSSProperties, JSXElementConstructor } from "react";

import { Arrow } from "./iconsCollection/Arrow";
import { Collapse } from "./iconsCollection/Collapse";
import { DropdownArrow } from "./iconsCollection/DropdownArrow";
import { Expand } from "./iconsCollection/Expand";
import { TriangleArrow } from "./iconsCollection/TriangleArrow";
import { IconTokenEnum } from "./iconToken.enum";

export const IconsList: Record<
	IconTokenEnum,
	JSXElementConstructor<{ styles: CSSProperties }>
> = {
	[IconTokenEnum.Arrow]: Arrow,
	[IconTokenEnum.Collapse]: Collapse,
	[IconTokenEnum.DropdownArrow]: DropdownArrow,
	[IconTokenEnum.Expand]: Expand,
	[IconTokenEnum.TriangleArrow]: TriangleArrow,
};
