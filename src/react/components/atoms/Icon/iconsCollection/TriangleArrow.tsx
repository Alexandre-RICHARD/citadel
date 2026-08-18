import React from "react";

type Props = {
	styles: React.CSSProperties;
};

export function TriangleArrow({ styles }: Props): React.JSX.Element {
	return (
		<svg
			style={styles}
			viewBox="0 0 100 100"
			width="100"
			height="100"
		>
			<path d="m 50,4.6515 50,90.697358 H 0 Z" />
		</svg>
	);
}
