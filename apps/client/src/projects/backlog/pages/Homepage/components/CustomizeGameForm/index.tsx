import { customizeUserGameBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/userGames/customizeUserGame/customizeUserGameBodySchema";
import { Palette } from "lucide-react";
import { useState } from "react";

import { checkInput } from "../../../../../../common/validation/checkInput";
import { backlogFieldLabels } from "../../../../api/backlogFieldLabels";
import type { CustomizationFm } from "../../../../api/model/customizationFm.type";
import type { StoredGameFm } from "../../../../api/model/storedGameFm.type";
import { useAllSeries } from "../../../../api/series/useAllSeries";
import { useCustomizeUserGame } from "../../../../api/userGame/useCustomizeUserGame";
import styles from "../../../../backlog.module.scss";
import { Callout } from "../../../../components/Callout";
import { Modal } from "../../../../components/Modal";
import type { CustomizationDraft } from "../../../../helper/series/customizationDraft.type";
import { getChosenSeriesId } from "../../../../helper/series/getChosenSeriesId";
import { toSeriesChoice } from "../../../../helper/series/toSeriesChoice";
import { ModalActions } from "../ModalActions";
import { UserGameFields } from "../UserGameFields";

type Props = {
	storedGame: StoredGameFm;
	onClose: () => void;
};

// La personnalisation actuelle, en saisie
function toCustomizationDraft(
	customization: CustomizationFm,
	proposedSeriesId: number | null,
): CustomizationDraft {
	return {
		imageId: customization.imageId,
		endingType: customization.endingType,
		series: toSeriesChoice(proposedSeriesId, customization.series?.id ?? null),
		seriesNumber: customization.seriesNumber,
	};
}

// Miniature, type de fin, série et numéro d'un jeu du backlog ; « Valider » reste inactif sans changement
export function CustomizeGameForm({ storedGame, onClose }: Props) {
	const { customization, proposedSeries } = storedGame;
	const [draft, setDraft] = useState<CustomizationDraft | null>(() =>
		customization === null
			? null
			: toCustomizationDraft(customization, proposedSeries?.id ?? null),
	);
	const allSeries = useAllSeries();
	const customizeUserGame = useCustomizeUserGame(storedGame.id);
	const check =
		draft === null
			? null
			: checkInput(customizeUserGameBodySchema, draft, backlogFieldLabels);
	// Une nouvelle série (undefined) est toujours un changement ; sans série, le numéro ne compte pas
	const chosenSeriesId =
		draft === null
			? null
			: getChosenSeriesId(draft.series, proposedSeries, allSeries);
	const hasChanges =
		draft !== null &&
		customization !== null &&
		(draft.imageId !== customization.imageId ||
			draft.endingType !== customization.endingType ||
			chosenSeriesId !== (customization.series?.id ?? null) ||
			(chosenSeriesId === null ? null : draft.seriesNumber) !==
				customization.seriesNumber);

	return (
		<Modal
			title="Personnaliser"
			subtitle={storedGame.frenchName ?? storedGame.name}
			icon={Palette}
			actions={
				<ModalActions
					canValidate={check?.isValid === true && hasChanges}
					onCancel={onClose}
					onValidate={() => {
						if (check?.isValid === true) customizeUserGame.mutate(check.data);
						onClose();
					}}
				/>
			}
			onClose={onClose}
		>
			{draft === null || customization === null ? (
				<Callout tone="danger">Ce jeu n’est plus dans le backlog.</Callout>
			) : (
				<div className={styles.formStack}>
					{draft.endingType !== customization.endingType && (
						<Callout tone="warning">
							Changer le type de fin convertit les statuts devenus incompatibles
							: Fini ↔ Estimé fini, Vu sans jouer → Pas commencé.
						</Callout>
					)}
					<UserGameFields
						gameId={storedGame.id}
						draft={draft}
						proposedSeries={proposedSeries}
						currentSeriesId={customization.series?.id ?? null}
						currentSeriesNumber={customization.seriesNumber}
						onChange={setDraft}
					/>
					{check?.isValid === false && (
						<Callout tone="danger">{check.message}</Callout>
					)}
				</div>
			)}
		</Modal>
	);
}
