import type { CSSProperties, ReactNode } from "react";

type Props = {
	styles: CSSProperties;
};

export function Close({ styles }: Props): ReactNode {
	return (
		<svg
			style={styles}
			width="100"
			height="100"
			viewBox="0 0 100 100"
		>
			<path d="M 14 0 L 50 36 L 86 0 L 100 14 L 64 50 L 100 86 L 86 100 L 50 64 L 14 100 L 0 86 L 36 50 L 0 14 Z" />
		</svg>
	);
}
