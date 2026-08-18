import type { ReactNode } from "react";

import styles from "./cacheOverlay.module.scss";

type Props = {
	children: ReactNode;
};

export function CacheOverlay({ children }: Props) {
	return <div className={styles.cacheOverlay}>{children}</div>;
}
