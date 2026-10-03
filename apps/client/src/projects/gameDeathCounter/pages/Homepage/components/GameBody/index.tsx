import { IconButton } from "@citadel/design-system/src/atoms/IconButton";
import { Skeleton } from "@citadel/design-system/src/atoms/Skeleton";
import { createBossBodySchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/createBoss/createBossBodySchema";
import { Plus, Save, X } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";

import { checkInput } from "../../../../../../common/validation/checkInput";
import { QueryErrorBoundary } from "../../../../../../react/QueryErrorBoundary";
import { useCreateBoss } from "../../../../api/boss/useCreateBoss";
import { useGame } from "../../../../api/game/useGame";
import { gameDeathCounterErrorReasons } from "../../../../api/gameDeathCounterErrorReasons";
import { gameDeathCounterFieldLabels } from "../../../../api/gameDeathCounterFieldLabels";
import globalStyles from "../../../../globalStyles.module.scss";
import { BossList } from "../BossList";
import { BOSS_LIST_PLACEHOLDER } from "../BossList/bossListPlaceholder";
import styles from "./gameBody.module.scss";

type Props = {
	gameId: number;
};

function LoadedBossList({ gameId }: Props) {
	const { bosses } = useGame(gameId);
	return (
		<BossList
			gameId={gameId}
			bosses={bosses}
		/>
	);
}

// Contenu d'un jeu déplié : ses boss, chargés à la demande, et l'ajout d'un boss
export function GameBody({ gameId }: Props) {
	const inputRef = useRef<HTMLInputElement>(null);

	const [addingBoss, setAddingBoss] = useState(false);
	const [newBossName, setNewBossName] = useState("");

	const createBoss = useCreateBoss(gameId);
	const nameCheck = checkInput(
		createBossBodySchema,
		{ name: newBossName },
		gameDeathCounterFieldLabels,
	);

	useEffect(() => {
		if (addingBoss) {
			inputRef.current?.focus();
		}
	}, [addingBoss]);

	function submitNewBoss() {
		if (!nameCheck.isValid || createBoss.isPending) return;
		createBoss.mutate(nameCheck.data);
		setNewBossName("");
		setAddingBoss(false);
	}

	return (
		<div className={styles.gameBody}>
			<QueryErrorBoundary
				actionLabel="charger les boss"
				errorReasons={gameDeathCounterErrorReasons}
			>
				<Suspense
					fallback={
						<Skeleton label="Chargement des boss">
							<BossList
								gameId={gameId}
								bosses={BOSS_LIST_PLACEHOLDER}
							/>
						</Skeleton>
					}
				>
					<LoadedBossList gameId={gameId} />
				</Suspense>
			</QueryErrorBoundary>

			{addingBoss ? (
				<div className={styles.addBossForm}>
					<div className={styles.addBossField}>
						<input
							ref={inputRef}
							type="text"
							value={newBossName}
							onChange={(e) => setNewBossName(e.target.value)}
							placeholder="Nom du boss"
							aria-invalid={!nameCheck.isValid && newBossName !== ""}
							className={globalStyles.fieldInput}
							onKeyDown={(e) => e.key === "Enter" && submitNewBoss()}
						/>
						{!nameCheck.isValid && newBossName.trim() !== "" && (
							<p className={globalStyles.inputError}>{nameCheck.message}</p>
						)}
					</div>
					<IconButton
						icon={Save}
						label="Ajouter"
						variant="primary"
						disabled={!nameCheck.isValid || createBoss.isPending}
						onClick={submitNewBoss}
					/>
					<IconButton
						icon={X}
						label="Annuler"
						onClick={() => setAddingBoss(false)}
					/>
				</div>
			) : (
				<button
					type="button"
					className={styles.addBossTrigger}
					onClick={() => setAddingBoss(true)}
				>
					<Plus
						size={16}
						strokeWidth={2.4}
					/>
					Ajouter un boss
				</button>
			)}
		</div>
	);
}
