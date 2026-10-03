import type { CSSProperties, JSXElementConstructor } from "react";

import { Arrow } from "./IconsCollection/Arrow";
import { Close } from "./IconsCollection/Close";
import { Collapse } from "./IconsCollection/Collapse";
import { DropdownArrow } from "./IconsCollection/DropdownArrow";
import { Expand } from "./IconsCollection/Expand";
import { TriangleArrow } from "./IconsCollection/TriangleArrow";
import { IconTokenEnum } from "./iconToken.enum";

export const IconsList: Record<
	IconTokenEnum,
	JSXElementConstructor<{ styles: CSSProperties }>
> = {
	[IconTokenEnum.Arrow]: Arrow,
	[IconTokenEnum.Close]: Close,
	[IconTokenEnum.Collapse]: Collapse,
	[IconTokenEnum.DropdownArrow]: DropdownArrow,
	[IconTokenEnum.Expand]: Expand,
	[IconTokenEnum.TriangleArrow]: TriangleArrow,
};
