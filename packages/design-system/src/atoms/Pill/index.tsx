import type { ReactNode } from "react";

import styles from "./pill.module.scss";

type Props = {
	children: ReactNode;
};

export function Pill({ children }: Props) {
	return <span className={styles.pill}>{children}</span>;
}
