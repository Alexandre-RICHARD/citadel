import React from "react";

import { IconsList } from "./iconsList.dictionnary";
import type { IconTokenEnum } from "./iconToken.enum";

type PropsType = {
	iconToken: IconTokenEnum;
	size: number;
	color?: string;
};

export function Icon({ iconToken, size, color }: PropsType): React.JSX.Element {
	const IconToDisplay = IconsList[iconToken];

	const styles = {
		fill: color,
		width: `${size}px`,
		height: `${size}px`,
	};

	return <IconToDisplay styles={styles} />;
}
