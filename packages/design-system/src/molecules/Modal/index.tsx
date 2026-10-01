import type { ReactNode } from "react";

import { Button } from "../../atoms/Button";
import { CacheOverlay } from "../../atoms/CacheOverlay";
import styles from "./modal.module.scss";

type Props = {
	children: ReactNode;
	closeLabel?: string;
	submitLabel?: string;
	onClose: () => void;
	onSubmit: () => void;
};

export function Modal({
	children,
	closeLabel = "Fermer la modal",
	submitLabel = "Valider",
	onClose,
	onSubmit,
}: Props) {
	return (
		<CacheOverlay>
			<div className={styles.modalContainer}>
				{children}
				<div className={styles.modalFooter}>
					<Button
						label={closeLabel}
						onClick={onClose}
					/>
					<Button
						label={submitLabel}
						onClick={onSubmit}
					/>
				</div>
			</div>
		</CacheOverlay>
	);
}
