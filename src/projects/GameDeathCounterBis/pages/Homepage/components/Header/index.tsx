import { Plus, Save, X } from "lucide-react";
import { useState } from "react";

import globalStyles from "../../../../globalStyles.module.scss";
import { Count } from "../Count";
import { IconButton } from "../IconButton";
import styles from "./header.module.scss";

type Props = {
	submitNewGame: (name: string, callback?: () => void) => void;
	grandTotal: number;
};

export function Header({ submitNewGame, grandTotal }: Props) {
	const [addingGame, setAddingGame] = useState(false);
	const [newGameName, setNewGameName] = useState("");

	const submit = (gameName: string) => {
		submitNewGame(gameName, () => {
			setNewGameName("");
			setAddingGame(false);
		});
	};

	return (
		<>
			<header className={styles.topBar}>
				<div className={styles.topBarTitle}>
					<span className={styles.eyebrow}>
						From Software · journal des trépas
					</span>
					<h1>Compteur de morts</h1>
				</div>
				<div className={styles.topBarRight}>
					<Count
						count={grandTotal}
						size="md"
						variant="dark"
					/>
					<button
						type="button"
						className={styles.headerButtonPrimary}
						onClick={() => setAddingGame((v) => !v)}
					>
						<Plus
							size={16}
							strokeWidth={2.4}
						/>
						Nouveau jeu
					</button>
				</div>
			</header>

			{addingGame && (
				<div className={styles.addGameBar}>
					<input
						type="text"
						value={newGameName}
						onChange={(e) => setNewGameName(e.target.value)}
						placeholder="Nom du jeu (ex : Bloodborne)"
						className={globalStyles.fieldInput}
						autoFocus
						onKeyDown={(e) => e.key === "Enter" && submit(newGameName)}
					/>
					<IconButton
						icon={Save}
						label="Créer le jeu"
						variant="gold"
						onClick={() => submit(newGameName)}
					/>
					<IconButton
						icon={X}
						label="Annuler"
						onClick={() => setAddingGame(false)}
					/>
				</div>
			)}
		</>
	);
}
