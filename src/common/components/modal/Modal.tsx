import type { ReactNode } from "react";

import { Button } from "../button/Button";
import { CacheOverlay } from "../cacheOverlay/CacheOverlay";
import styles from "./modal.module.scss";

type Props = {
	children: ReactNode;
	onClose: () => void;
	onSubmit: () => void;
};

export function Modal({ children, onClose, onSubmit }: Props) {
	return (
		<CacheOverlay>
			<div className={styles.modalContainer}>
				{children}
				<div className={styles.modalFooter}>
					<Button
						label="Fermer la modal"
						onClick={onClose}
					/>
					<Button
						label="Valider"
						onClick={onSubmit}
					/>
				</div>
			</div>
		</CacheOverlay>
	);
}
