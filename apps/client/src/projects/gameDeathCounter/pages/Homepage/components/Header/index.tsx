import { CountBadge } from "@citadel/design-system/src/atoms/CountBadge";
import { IconButton } from "@citadel/design-system/src/atoms/IconButton";
import { createGameBodySchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/createGame/createGameBodySchema";
import { Flame, Plus, Save, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { checkInput } from "../../../../../../common/validation/checkInput";
import { useCreateGame } from "../../../../api/game/useCreateGame";
import { useGameListTotalDeath } from "../../../../api/game/useGameListTotalDeath";
import { gameDeathCounterFieldLabels } from "../../../../api/gameDeathCounterFieldLabels";
import globalStyles from "../../../../globalStyles.module.scss";
import styles from "./header.module.scss";

export function Header() {
	const inputRef = useRef<HTMLInputElement>(null);

	const [addingGame, setAddingGame] = useState(false);
	const [newGameName, setNewGameName] = useState("");

	const grandTotal = useGameListTotalDeath();
	const createGame = useCreateGame();
	const nameCheck = checkInput(
		createGameBodySchema,
		{ name: newGameName },
		gameDeathCounterFieldLabels,
	);

	function submit() {
		if (!nameCheck.isValid || createGame.isPending) return;
		createGame.mutate(nameCheck.data);
		setNewGameName("");
		setAddingGame(false);
	}

	useEffect(() => {
		if (addingGame) {
			inputRef.current?.focus();
		}
	}, [addingGame]);

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
					{/* Absent tant que la liste n'est pas chargée : son chargement et ses erreurs s'affichent dans la page */}
					{grandTotal !== null && (
						<CountBadge
							count={grandTotal}
							icon={Flame}
							flickerIcon
							size="md"
							variant="neutral"
						/>
					)}
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
					<div className={styles.addGameField}>
						<input
							ref={inputRef}
							type="text"
							value={newGameName}
							onChange={(e) => setNewGameName(e.target.value)}
							placeholder="Nom du jeu (ex : Bloodborne)"
							aria-invalid={!nameCheck.isValid && newGameName !== ""}
							className={globalStyles.fieldInput}
							onKeyDown={(e) => e.key === "Enter" && submit()}
						/>
						{/* Champ vide : Créer est désactivé, inutile de le signaler */}
						{!nameCheck.isValid && newGameName.trim() !== "" && (
							<p className={globalStyles.inputError}>{nameCheck.message}</p>
						)}
					</div>
					<IconButton
						icon={Save}
						label="Créer le jeu"
						variant="primary"
						disabled={!nameCheck.isValid || createGame.isPending}
						onClick={submit}
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
