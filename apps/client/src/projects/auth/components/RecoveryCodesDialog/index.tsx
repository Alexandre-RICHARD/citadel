import { useEffect, useRef } from "react";

import { RecoveryCodesPanel } from "../RecoveryCodesPanel";
import styles from "./recoveryCodesDialog.module.scss";

type Props = {
	codes: readonly string[];
	email: string;
	// Les codes sont sauvegardés : la fenêtre se ferme, ils ne reviendront plus
	onAcknowledge: () => void;
};

/**
 * Les codes de secours du profil, dans une fenêtre au-dessus de la page : ils s'affichent là où l'on regarde, quel que soit
 * l'endroit du profil où l'action a eu lieu, au lieu d'un panneau en haut de page qu'il faut aller chercher en défilant.
 * <dialog> natif : piège du focus et fond inerte viennent du navigateur. Échap ne la ferme pas : seuls les codes
 * sauvegardés le font (ils ne reviendront pas), voir RecoveryCodesPanel
 */
export function RecoveryCodesDialog({ codes, email, onAcknowledge }: Props) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (dialog !== null && !dialog.open) dialog.showModal();
	}, []);

	return (
		<dialog
			ref={dialogRef}
			className={styles.dialog}
			aria-label="Vos codes de secours"
			onCancel={(event) => event.preventDefault()}
		>
			<RecoveryCodesPanel
				codes={codes}
				email={email}
				onAcknowledge={onAcknowledge}
			/>
		</dialog>
	);
}
