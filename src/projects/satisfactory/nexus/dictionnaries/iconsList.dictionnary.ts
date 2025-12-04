import type React from "react";

import { IconTokenEnum } from "../enums/iconToken.enum";
import { Arrow } from "../react/icons/Arrow";
import { Collapse } from "../react/icons/Collapse";
import { DropdownArrow } from "../react/icons/DropdownArrow";
import { Expand } from "../react/icons/Expand";
import { TriangleArrow } from "../react/icons/TriangleArrow";

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
