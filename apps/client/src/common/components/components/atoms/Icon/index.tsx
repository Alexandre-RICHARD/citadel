import { type ReactNode } from "react";

import { IconsList } from "./iconsList.dictionnary.ts";
import type { IconTokenEnum } from "./iconToken.enum";

type PropsType = {
	iconToken: IconTokenEnum;
	size: number;
	color?: string;
};

export function Icon({ iconToken, size, color }: PropsType): ReactNode {
	const IconToDisplay = IconsList[iconToken];

	const styles = {
		fill: color,
		width: `${size}px`,
		height: `${size}px`,
	};

	return <IconToDisplay styles={styles} />;
}
