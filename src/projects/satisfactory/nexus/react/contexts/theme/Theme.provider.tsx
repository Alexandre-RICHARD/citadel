import type React from "react";

import { themeApplicator } from "../../../helpers/theme/themeApplicator";
import type { ThemeType } from "../../../types/react/theme.type";

type PropsType = {
  theme: ThemeType;
  children: React.JSX.Element;
};

export const ThemeProvider = ({
  children,
  theme,
}: PropsType): React.JSX.Element => {
  themeApplicator(theme);

  return children;
};
