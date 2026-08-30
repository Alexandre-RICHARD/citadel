import React from "react";

import styles from "./styles.module.scss";

type PropsType = {
	image: React.JSX.Element;
	label: React.JSX.Element;
	position: "left" | "right";
};

export function LabelWithIcon({
	image,
	label,
	position,
}: PropsType): React.JSX.Element {
	return (
		<div className={styles.label_with_icon}>
			{position === "left" && <div className={styles.side_image}>{image}</div>}
			<div className={styles.label_container}>{label}</div>
			{position === "right" && <div className={styles.side_image}>{image}</div>}
		</div>
	);
}
