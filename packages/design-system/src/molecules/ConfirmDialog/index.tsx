import { type ReactNode, useEffect, useId, useRef } from "react";

import styles from "./confirmDialog.module.scss";

type Props = {
	open: boolean;
	title: string;
	description?: ReactNode;
	confirmLabel: string;
	cancelLabel?: string;
	// Action irréversible : bouton de confirmation rouge
	destructive?: boolean;
	// Le parent ferme la modale (open à false) dans les deux cas
	onConfirm: () => void;
	onCancel: () => void;
};

// <dialog> natif : piège du focus, Échap et fond inerte sont fournis par le navigateur
export function ConfirmDialog({
	open,
	title,
	description,
	confirmLabel,
	cancelLabel = "Annuler",
	destructive = false,
	onConfirm,
	onCancel,
}: Props) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const titleId = useId();
	const descriptionId = useId();

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	return (
		<dialog
			ref={dialogRef}
			className={styles.confirmDialog}
			role="alertdialog"
			aria-labelledby={titleId}
			aria-describedby={description === undefined ? undefined : descriptionId}
			// Échap : le parent décide de la fermeture, comme pour Annuler
			onCancel={(event) => {
				event.preventDefault();
				onCancel();
			}}
		>
			<h2
				id={titleId}
				className={styles.title}
			>
				{title}
			</h2>
			{description === undefined ? null : (
				<div
					id={descriptionId}
					className={styles.description}
				>
					{description}
				</div>
			)}
			{/* Annuler en premier : il reçoit le focus à l'ouverture, Entrée ne confirme pas par mégarde */}
			<div className={styles.footer}>
				<button
					type="button"
					className={styles.cancel}
					onClick={onCancel}
				>
					{cancelLabel}
				</button>
				<button
					type="button"
					className={styles.confirm}
					data-destructive={destructive}
					onClick={onConfirm}
				>
					{confirmLabel}
				</button>
			</div>
		</dialog>
	);
}
