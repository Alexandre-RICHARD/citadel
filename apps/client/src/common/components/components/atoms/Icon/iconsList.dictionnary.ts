import type { CSSProperties, JSXElementConstructor } from "react";

import { Arrow } from "./iconsCollection/Arrow.tsx";
import { Collapse } from "./iconsCollection/Collapse.tsx";
import { DropdownArrow } from "./iconsCollection/DropdownArrow.tsx";
import { Expand } from "./iconsCollection/Expand.tsx";
import { TriangleArrow } from "./iconsCollection/TriangleArrow.tsx";
import { IconTokenEnum } from "./iconToken.enum.ts";

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
