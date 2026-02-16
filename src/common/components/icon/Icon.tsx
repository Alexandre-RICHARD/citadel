import React from "react";

import { IconsList } from "./iconsList.dictionnary";
import type { IconTokenEnum } from "./iconToken.enum";

type PropsType = {
	iconToken: IconTokenEnum;
	size: number;
	color?: string;
};

export function IconContainer({
	iconToken,
	size,
	color,
}: PropsType): React.JSX.Element {
	const Icon = IconsList[iconToken];

	const styles = {
		fill: color,
		width: `${size}px`,
		height: `${size}px`,
	};

	return <Icon styles={styles} />;
}
