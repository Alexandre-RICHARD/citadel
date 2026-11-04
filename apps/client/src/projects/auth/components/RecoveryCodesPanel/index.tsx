import { Check, Download, KeyRound } from "lucide-react";
import { useState } from "react";

import { buildRecoveryCodesFile } from "../../helper/recoveryCodes/buildRecoveryCodesFile";
import { buildRecoveryCodesFileName } from "../../helper/recoveryCodes/buildRecoveryCodesFileName";
import { FormAlert } from "../FormAlert";
import { ProfileSection } from "../ProfileSection";
import styles from "./recoveryCodesPanel.module.scss";

type Props = {
	codes: readonly string[];
	email: string;
	// Les codes sont sauvegardés : ils disparaissent de la page, pour toujours
	onAcknowledge: () => void;
};

function downloadTextFile(name: string, text: string): void {
	const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
	const link = document.createElement("a");
	link.href = url;
	link.download = name;
	link.click();
	URL.revokeObjectURL(url);
}

// Les codes de secours qui viennent d'être donnés : montrés une seule fois, avec leur téléchargement en texte. Le bouton
// final n'apparaît qu'une fois le fichier téléchargé ou la case cochée, pour qu'on ne les perde pas par un clic distrait
export function RecoveryCodesPanel({ codes, email, onAcknowledge }: Props) {
	const [isSaved, setIsSaved] = useState(false);

	function handleDownload(): void {
		const now = new Date();
		downloadTextFile(
			buildRecoveryCodesFileName(now),
			buildRecoveryCodesFile({ codes, email, date: now }),
		);
		setIsSaved(true);
	}

	return (
		<ProfileSection
			icon={<KeyRound />}
			title="Tes codes de secours"
			lead="Chacun ne sert qu’une fois, quand tu ne peux plus utiliser ta double authentification (téléphone perdu, boîte mail inaccessible)."
		>
			<FormAlert tone="info">
				Sauvegarde-les en lieu sûr : tu ne pourras plus jamais les revoir ici.
			</FormAlert>
			<ul className={styles.codes}>
				{codes.map((code) => (
					<li key={code}>{code}</li>
				))}
			</ul>
			<button
				type="button"
				className={styles.download}
				onClick={handleDownload}
			>
				<Download aria-hidden />
				Télécharger en texte
			</button>
			<label className={styles.checkbox}>
				<input
					type="checkbox"
					checked={isSaved}
					onChange={(event) => setIsSaved(event.target.checked)}
				/>
				J’ai sauvegardé mes codes de secours
			</label>
			<button
				type="button"
				className={styles.acknowledge}
				disabled={!isSaved}
				onClick={onAcknowledge}
			>
				<Check aria-hidden />
				Terminé
			</button>
		</ProfileSection>
	);
}
