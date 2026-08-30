import type React from "react";

import type { ThemeType } from "./theme.type";
import { themeApplicator } from "./themeApplicator";

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
