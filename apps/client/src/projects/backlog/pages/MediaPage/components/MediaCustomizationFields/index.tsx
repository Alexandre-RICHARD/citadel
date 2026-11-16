import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";
import { SagaChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/sagaChoiceKind.enum";
import { formatSeriesNumber } from "@citadel/specs/src/projects/backlog/helper/seriesNumber/formatSeriesNumber";
import { getNextSeriesNumber } from "@citadel/specs/src/projects/backlog/helper/seriesNumber/getNextSeriesNumber";
import { Check, Plus } from "lucide-react";

import { buildFailureMessage } from "../../../../../../common/api/error/buildFailureMessage";
import { getErrorReason } from "../../../../../../common/api/error/getErrorReason";
import { backlogErrorReasons } from "../../../../api/backlogErrorReasons";
import { useAllSagas } from "../../../../api/media/useAllSagas";
import { useMediaPosters } from "../../../../api/media/useMediaPosters";
import { useSagaEntries } from "../../../../api/media/useSagaEntries";
import styles from "../../../../backlog.module.scss";
import { Callout } from "../../../../components/Callout";
import { Select } from "../../../../components/Select";
import type { SelectOption } from "../../../../components/Select/selectOption.type";
import { Spinner } from "../../../../components/Spinner";
import { getChosenSagaId } from "../../../../helper/media/getChosenSagaId";
import type { MediaCustomizationDraft } from "../../../../helper/media/mediaCustomizationDraft.type";
import { FormField } from "../../../Homepage/components/FormField";
import { SeriesNumberField } from "../../../Homepage/components/SeriesNumberField";
import { MediaThumbnail } from "../MediaThumbnail";

const OTHER_SAGA_PREFIX = "other-";

type Props = {
	mediaType: MediaTypeEnum;
	tmdbId: number;
	// La ligne du média dans le backlog, absente des numéros pris ; null à l'ajout
	userMediaId: number | null;
	draft: MediaCustomizationDraft;
	// La saga que propose la collection TMDB d'un film, à l'ajout seulement
	proposedSaga: { sagaId: number | null; name: string } | null;
	// Saga et numéro actuels ; null à l'ajout
	currentSagaId: number | null;
	currentSagaNumber: number | null;
	onChange: (draft: MediaCustomizationDraft) => void;
};

// Valeur de la liste des sagas : une clé par choix, « other-12 » pour une saga du compte
function formatSagaValue(choice: MediaCustomizationDraft["saga"]): string {
	return choice.kind === SagaChoiceKindEnum.OTHER
		? `${OTHER_SAGA_PREFIX}${choice.sagaId}`
		: choice.kind;
}

function parseSagaValue(value: string): MediaCustomizationDraft["saga"] {
	if (value.startsWith(OTHER_SAGA_PREFIX))
		return {
			kind: SagaChoiceKindEnum.OTHER,
			sagaId: Number(value.slice(OTHER_SAGA_PREFIX.length)),
		};
	if (value === String(SagaChoiceKindEnum.NEW))
		return { kind: SagaChoiceKindEnum.NEW, name: "" };
	if (value === String(SagaChoiceKindEnum.PROPOSED))
		return { kind: SagaChoiceKindEnum.PROPOSED };
	return { kind: SagaChoiceKindEnum.NONE };
}

/**
 * Personnalisation d'un film ou d'une série, à l'ajout ou par « Personnaliser » : miniature (parmi les affiches TMDB), saga
 * et numéro dans la saga. Sans numéro, le média passe après les autres médias de la saga
 */
export function MediaCustomizationFields({
	mediaType,
	tmdbId,
	userMediaId,
	draft,
	proposedSaga,
	currentSagaId,
	currentSagaNumber,
	onChange,
}: Props) {
	const posters = useMediaPosters(mediaType, tmdbId);
	const sagas = useAllSagas();
	const chosenSagaId = getChosenSagaId(draft.saga, proposedSaga, sagas);
	const { entries } = useSagaEntries(chosenSagaId ?? null);
	const otherEntries = (entries ?? [])
		.filter((entry) => entry.userMediaId !== userMediaId)
		.map(({ userMediaId: gameId, sagaNumber }) => ({
			gameId,
			seriesNumber: sagaNumber,
		}));
	const numberOwner =
		draft.sagaNumber === null
			? undefined
			: (entries ?? []).find(
					(entry) =>
						entry.userMediaId !== userMediaId &&
						entry.sagaNumber === draft.sagaNumber,
				);
	const hasSaga = chosenSagaId !== null;
	// En attendant TMDB, ou s'il échoue, seule l'image déjà choisie est proposée
	const shownPaths =
		posters.posterPaths ?? (draft.imagePath === null ? [] : [draft.imagePath]);
	const sagaValue = formatSagaValue(draft.saga);

	// Revenir à la saga actuelle lui rend son numéro ; une autre saga le range après ses médias
	function changeSaga(saga: MediaCustomizationDraft["saga"]) {
		const sagaId = getChosenSagaId(saga, proposedSaga, sagas);
		onChange({
			...draft,
			saga,
			sagaNumber:
				sagaId !== null && sagaId === currentSagaId ? currentSagaNumber : null,
		});
	}

	// La saga proposée par TMDB d'abord, puis « Aucune », les sagas du compte par nom et la création d'une saga
	const sagaOptions: SelectOption<string>[] = [
		...(proposedSaga === null
			? []
			: [
					{
						value: SagaChoiceKindEnum.PROPOSED,
						label: `${proposedSaga.name} (TMDB)`,
						content: (
							<span className={styles.optionWithTag}>
								{proposedSaga.name}
								<span className={styles.tag}>TMDB</span>
							</span>
						),
					},
				]),
		{ value: SagaChoiceKindEnum.NONE, label: "Aucune" },
		...sagas
			.filter(({ id }) => id !== proposedSaga?.sagaId)
			.map(({ id, name }) => ({
				value: `${OTHER_SAGA_PREFIX}${id}`,
				label: name,
			})),
		{
			value: SagaChoiceKindEnum.NEW,
			label: "Nouvelle saga…",
			content: (
				<span className={styles.optionWithIcon}>
					<Plus aria-hidden />
					Nouvelle saga…
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
				{posters.posterPaths === null && posters.error === null && (
					<span className={styles.inlineStatus}>
						<Spinner />
						Chargement des affiches TMDB…
					</span>
				)}
				{posters.error !== null && (
					<Callout tone="danger">
						{buildFailureMessage(
							"charger les affiches",
							getErrorReason(posters.error, {
								projectReasons: backlogErrorReasons,
							}),
						)}
					</Callout>
				)}
				{posters.posterPaths !== null && shownPaths.length === 0 && (
					<span className={styles.inlineStatus}>Aucune affiche sur TMDB</span>
				)}
				{shownPaths.length > 0 && (
					<div className={styles.imageChoices}>
						{shownPaths.map((path, index) => (
							<button
								key={path}
								type="button"
								className={joinClassNames(
									styles.imageChoice,
									path === draft.imagePath && styles.selectedImageChoice,
								)}
								aria-pressed={path === draft.imagePath}
								aria-label={`Affiche ${index + 1} sur ${shownPaths.length}`}
								onClick={() => onChange({ ...draft, imagePath: path })}
							>
								<MediaThumbnail
									path={path}
									size="lg"
								/>
								{path === draft.imagePath && (
									<span className={styles.imageChoiceCheck}>
										<Check aria-hidden />
									</span>
								)}
							</button>
						))}
					</div>
				)}
			</FormField>

			<div className={styles.formRow}>
				<FormField label="Saga">
					<Select
						value={sagaValue}
						options={sagaOptions}
						ariaLabel="Saga"
						className={styles.seriesSelect}
						onChange={(value) => changeSaga(parseSagaValue(value))}
					/>
				</FormField>
				{draft.saga.kind === SagaChoiceKindEnum.NEW && (
					<FormField
						label="Nom de la nouvelle saga"
						isRequired
					>
						<input
							type="text"
							required
							className={styles.textInput}
							value={draft.saga.name}
							placeholder="Ex. Star Wars"
							// eslint-disable-next-line jsx-a11y/no-autofocus -- le champ apparaît au choix de « Nouvelle saga »
							autoFocus
							onChange={(event) =>
								onChange({
									...draft,
									saga: {
										kind: SagaChoiceKindEnum.NEW,
										name: event.target.value,
									},
								})
							}
						/>
					</FormField>
				)}
				{hasSaga && (
					// Vide, le média passe après les autres : le numéro grisé est celui qu'il prendra
					<FormField label="N° dans la saga">
						<SeriesNumberField
							// Un autre choix de saga repart de son numéro
							key={sagaValue}
							value={draft.sagaNumber}
							entries={otherEntries}
							isLive
							placeholder={formatSeriesNumber(
								getNextSeriesNumber(otherEntries),
								otherEntries,
							)}
							onCommit={(sagaNumber) => onChange({ ...draft, sagaNumber })}
						/>
					</FormField>
				)}
			</div>
			{draft.sagaNumber !== null && numberOwner !== undefined && (
				<Callout>
					N° {formatSeriesNumber(draft.sagaNumber, otherEntries)} déjà pris par{" "}
					{numberOwner.title} : il sera décalé d’un cran, avec les suivants si
					besoin.
				</Callout>
			)}
		</div>
	);
}
