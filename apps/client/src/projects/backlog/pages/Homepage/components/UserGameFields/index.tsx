import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import { SeriesChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/seriesChoiceKind.enum";
import { formatSeriesNumber } from "@citadel/specs/src/projects/backlog/rule/seriesNumber/formatSeriesNumber";
import { getNextSeriesNumber } from "@citadel/specs/src/projects/backlog/rule/seriesNumber/getNextSeriesNumber";
import { Check, Plus, Undo2 } from "lucide-react";

import { buildFailureMessage } from "../../../../../../common/api/error/buildFailureMessage";
import { getErrorReason } from "../../../../../../common/api/error/getErrorReason";
import { backlogErrorReasons } from "../../../../api/backlogErrorReasons";
import { useGameImages } from "../../../../api/igdb/useGameImages";
import type { SeriesFm } from "../../../../api/model/seriesFm.type";
import { useAllSeries } from "../../../../api/series/useAllSeries";
import { useSeriesEntries } from "../../../../api/series/useSeriesEntries";
import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";
import { Callout } from "../../../../components/Callout";
import { SegmentedControl } from "../../../../components/SegmentedControl";
import { Select } from "../../../../components/Select";
import type { SelectOption } from "../../../../components/Select/selectOption.type";
import { Spinner } from "../../../../components/Spinner";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";
import { endingTypeIcons } from "../../../../helper/label/endingTypeIcons";
import { endingTypeLabels } from "../../../../helper/label/endingTypeLabels";
import type { CustomizationDraft } from "../../../../helper/series/customizationDraft.type";
import { getChosenSeriesId } from "../../../../helper/series/getChosenSeriesId";
import type { SeriesChoice } from "../../../../helper/series/seriesChoice.type";
import { FormField } from "../FormField";
import { SeriesNumberField } from "../SeriesNumberField";
import { Thumbnail } from "../Thumbnail";

const OTHER_SERIES_PREFIX = "other-";

type Props = {
	gameId: number;
	draft: CustomizationDraft;
	proposedSeries: SeriesFm | null;
	// Série et numéro actuels du jeu dans le backlog ; null à l'ajout au backlog
	currentSeriesId: number | null;
	currentSeriesNumber: number | null;
	onChange: (draft: CustomizationDraft) => void;
};

// Valeur de la liste des séries : une clé par choix, « other-12 » pour une autre série
function formatSeriesValue(
	choice: SeriesChoice,
	hasProposedSeries: boolean,
): string {
	switch (choice.kind) {
		case SeriesChoiceKindEnum.OTHER:
			return `${OTHER_SERIES_PREFIX}${choice.seriesId}`;
		case SeriesChoiceKindEnum.NONE:
			return hasProposedSeries
				? SeriesChoiceKindEnum.NONE
				: SeriesChoiceKindEnum.PROPOSED;
		default:
			return choice.kind;
	}
}

function parseSeriesValue(value: string): SeriesChoice {
	if (value.startsWith(OTHER_SERIES_PREFIX))
		return {
			kind: SeriesChoiceKindEnum.OTHER,
			seriesId: Number(value.slice(OTHER_SERIES_PREFIX.length)),
		};
	if (value === String(SeriesChoiceKindEnum.NONE))
		return { kind: SeriesChoiceKindEnum.NONE };
	if (value === String(SeriesChoiceKindEnum.NEW))
		return { kind: SeriesChoiceKindEnum.NEW, name: "" };
	return { kind: SeriesChoiceKindEnum.PROPOSED };
}

/**
 * Personnalisation d'un jeu du backlog, à l'ajout au backlog ou par « Personnaliser » :
 * miniature, type de fin, série et numéro dans la série. Les images sont relues sur IGDB à l'ouverture. Sans numéro,
 * le jeu passe après les autres jeux de la série
 */
export function UserGameFields({
	gameId,
	draft,
	proposedSeries,
	currentSeriesId,
	currentSeriesNumber,
	onChange,
}: Props) {
	const images = useGameImages(gameId);
	const allSeries = useAllSeries();
	const chosenSeriesId = getChosenSeriesId(
		draft.series,
		proposedSeries,
		allSeries,
	);
	const { entries } = useSeriesEntries(chosenSeriesId ?? null);
	const otherEntries = (entries ?? []).filter(
		(entry) => entry.gameId !== gameId,
	);
	const seriesNumberOwner =
		draft.seriesNumber === null
			? undefined
			: otherEntries.find(
					({ seriesNumber }) => seriesNumber === draft.seriesNumber,
				);
	const nextSeriesNumber = getNextSeriesNumber(otherEntries);

	// En attendant IGDB, ou s'il échoue, seule l'image déjà choisie est proposée
	const shownImageIds =
		images.imageIds ?? (draft.imageId === null ? [] : [draft.imageId]);
	const seriesValue = formatSeriesValue(draft.series, proposedSeries !== null);
	const hasSeries =
		draft.series.kind !== SeriesChoiceKindEnum.NONE &&
		!(
			draft.series.kind === SeriesChoiceKindEnum.PROPOSED &&
			proposedSeries === null
		);

	// Revenir à la série actuelle du jeu lui rend son numéro ; une autre série le range après ses jeux
	function changeSeries(series: SeriesChoice) {
		const seriesId = getChosenSeriesId(series, proposedSeries, allSeries);
		onChange({
			...draft,
			series,
			seriesNumber:
				seriesId !== null && seriesId === currentSeriesId
					? currentSeriesNumber
					: null,
		});
	}

	// La série proposée par IGDB d'abord, puis « Aucune », les autres séries par nom et la création d'une série
	const seriesOptions: SelectOption<string>[] = [
		{
			value: SeriesChoiceKindEnum.PROPOSED,
			label:
				proposedSeries === null
					? "Aucune (IGDB n’en propose pas)"
					: `${proposedSeries.name} (IGDB)`,
			content:
				proposedSeries === null ? (
					"Aucune (IGDB n’en propose pas)"
				) : (
					<span className={styles.optionWithTag}>
						{proposedSeries.name}
						<span className={styles.tag}>IGDB</span>
					</span>
				),
		},
		...(proposedSeries === null
			? []
			: [{ value: SeriesChoiceKindEnum.NONE, label: "Aucune" }]),
		...allSeries
			.filter(({ id }) => id !== proposedSeries?.id)
			.map(({ id, name }) => ({
				value: `${OTHER_SERIES_PREFIX}${id}`,
				label: name,
			})),
		{
			value: SeriesChoiceKindEnum.NEW,
			label: "Nouvelle série…",
			content: (
				<span className={styles.optionWithIcon}>
					<Plus aria-hidden />
					Nouvelle série…
				</span>
			),
		},
	];

	return (
		<div className={styles.formStack}>
			<FormField
				label="Miniature"
				isGroup
			>
				{images.imageIds === null && images.error === null && (
					<span className={styles.inlineStatus}>
						<Spinner />
						Chargement des images IGDB…
					</span>
				)}
				{images.error !== null && (
					<Callout tone="danger">
						{buildFailureMessage(
							"charger les images",
							getErrorReason(images.error, {
								projectReasons: backlogErrorReasons,
							}),
						)}
					</Callout>
				)}
				{images.imageIds !== null && shownImageIds.length === 0 && (
					<span className={styles.inlineStatus}>Aucune image sur IGDB</span>
				)}
				{shownImageIds.length > 0 && (
					<div className={styles.imageChoices}>
						{shownImageIds.map((imageId, index) => (
							<button
								key={imageId}
								type="button"
								className={joinClassNames(
									styles.imageChoice,
									imageId === draft.imageId && styles.selectedImageChoice,
								)}
								aria-pressed={imageId === draft.imageId}
								aria-label={`Image ${index + 1} sur ${shownImageIds.length}`}
								onClick={() => onChange({ ...draft, imageId })}
							>
								<Thumbnail
									imageId={imageId}
									size="lg"
								/>
								{imageId === draft.imageId && (
									<span className={styles.imageChoiceCheck}>
										<Check aria-hidden />
									</span>
								)}
							</button>
						))}
					</div>
				)}
			</FormField>

			<FormField
				label="Type de fin"
				hint={endingTypeLabels[draft.endingType].meaning}
				isGroup
			>
				<SegmentedControl
					value={draft.endingType}
					options={Object.values(EndingTypeEnum).map((endingType) => ({
						value: endingType,
						label: endingTypeLabels[endingType].label,
						icon: endingTypeIcons[endingType],
					}))}
					ariaLabel="Type de fin"
					onChange={(endingType) => onChange({ ...draft, endingType })}
				/>
			</FormField>

			<div className={styles.formRow}>
				<FormField label="Série">
					<Select
						value={seriesValue}
						options={seriesOptions}
						ariaLabel="Série"
						className={styles.seriesSelect}
						onChange={(value) => changeSeries(parseSeriesValue(value))}
					/>
				</FormField>
				{draft.series.kind === SeriesChoiceKindEnum.NEW && (
					<FormField label="Nom de la nouvelle série">
						<input
							type="text"
							className={styles.textInput}
							value={draft.series.name}
							placeholder="Ex. Souls"
							// eslint-disable-next-line jsx-a11y/no-autofocus -- le champ apparaît au choix de « Nouvelle série »
							autoFocus
							onChange={(event) =>
								onChange({
									...draft,
									series: {
										kind: SeriesChoiceKindEnum.NEW,
										name: event.target.value,
									},
								})
							}
						/>
					</FormField>
				)}
				{hasSeries && (
					// Vide, le jeu passe après les autres : le numéro grisé est celui qu'il prendra
					<FormField label="N° dans la série">
						<SeriesNumberField
							// Un autre choix de série repart de son numéro
							key={seriesValue}
							value={draft.seriesNumber}
							entries={otherEntries}
							isLive
							placeholder={formatSeriesNumber(nextSeriesNumber, otherEntries)}
							onCommit={(seriesNumber) => onChange({ ...draft, seriesNumber })}
						/>
					</FormField>
				)}
				{draft.series.kind !== SeriesChoiceKindEnum.PROPOSED && (
					<Button
						icon={Undo2}
						variant="ghost"
						tooltip={`Revenir à la série proposée par IGDB : ${proposedSeries?.name ?? "aucune"}`}
						className={styles.formRowButton}
						onClick={() =>
							changeSeries({ kind: SeriesChoiceKindEnum.PROPOSED })
						}
					>
						Série IGDB
					</Button>
				)}
			</div>
			{draft.seriesNumber !== null && seriesNumberOwner !== undefined && (
				<Callout>
					N° {formatSeriesNumber(draft.seriesNumber, otherEntries)} déjà pris
					par {seriesNumberOwner.frenchName ?? seriesNumberOwner.name} : il sera
					décalé d’un cran, avec les suivants si besoin.
				</Callout>
			)}
		</div>
	);
}
