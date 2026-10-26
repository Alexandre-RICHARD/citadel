import { CalendarDays, ExternalLink, Puzzle } from "lucide-react";

import type { GamePreviewFm } from "../../../../api/model/gamePreviewFm.type";
import styles from "../../../../backlog.module.scss";
import { Callout } from "../../../../components/Callout";
import { Checkbox } from "../../../../components/Checkbox";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";
import { toggleId } from "../../../../helper/list/toggleId";
import type { ImportSelection } from "../../importSelection.type";
import { CompanyLabel } from "../CompanyLabel";
import { Cover } from "../Cover";
import { ReleaseDateLabel } from "../ReleaseDateLabel";
import { SectionTitle } from "../SectionTitle";
import { VersionPlatformDates } from "../VersionPlatformDates";

type Props = {
	preview: GamePreviewFm;
	selection: ImportSelection;
	onSelectionChange: (selection: ImportSelection) => void;
};

/**
 * Tout ce qui est stocké en base globale, en lecture seule ; seules les versions et les DLC se
 * cochent, ce qui est déjà en base l'étant d'office. Un DLC peut aussi être coché « comme jeu », pour l'ajouter ensuite
 * comme jeu à part : IGDB ne distingue pas une extension vendue seule (TLAD et TBOGT y sont des extensions de GTA IV,
 * comme un season pass)
 */
export function GamePreview({ preview, selection, onSelectionChange }: Props) {
	const { game, versions, dlcs, warnings } = preview;
	const originalVersion = versions.find(({ isOriginal }) => isOriginal);
	const checkedVersionCount = versions.filter(
		({ id, isOriginal, isStored }) =>
			isOriginal || isStored || selection.versionIds.includes(id),
	).length;
	const checkedDlcCount = dlcs.filter(
		({ id, isStored }) => isStored || selection.dlcIds.includes(id),
	).length;

	return (
		<div className={styles.preview}>
			<section className={styles.previewHero}>
				<Cover imageId={originalVersion?.coverImageId ?? null} />
				<div className={styles.previewHeading}>
					<p className={styles.previewName}>{game.frenchName ?? game.name}</p>
					{game.frenchName !== null && (
						<p className={styles.secondaryName}>{game.name}</p>
					)}
					<p className={styles.previewMeta}>
						<span className={styles.previewRelease}>
							<CalendarDays aria-hidden />
							Sortie :
							<ReleaseDateLabel
								date={game.firstReleaseDate}
								isCancelled={game.isCancelled}
							/>
						</span>
						<a
							className={styles.externalLink}
							href={game.igdbUrl}
							target="_blank"
							rel="noreferrer"
						>
							Ouvrir sur IGDB
							<ExternalLink aria-hidden />
						</a>
					</p>
				</div>
			</section>

			<dl className={styles.facts}>
				<div className={styles.fact}>
					<dt>Série proposée</dt>
					<dd>{preview.proposedSeriesName ?? "—"}</dd>
				</div>
				<div className={styles.fact}>
					<dt>Développeur</dt>
					<dd>
						<CompanyLabel company={preview.developer} />
					</dd>
				</div>
				<div className={styles.fact}>
					<dt>Éditeur</dt>
					<dd>
						<CompanyLabel company={preview.publisher} />
					</dd>
				</div>
			</dl>

			<section>
				<SectionTitle count={`${checkedVersionCount} / ${versions.length}`}>
					Versions à enregistrer
				</SectionTitle>
				<ul className={styles.choiceList}>
					{versions.map((version) => {
						const isLocked = version.isOriginal || version.isStored;
						let lockReason: string | null = null;
						if (version.isOriginal)
							lockReason = "Toujours enregistrée : c’est la fiche du jeu";
						else if (version.isStored) lockReason = "Déjà en base";
						return (
							<li
								key={version.id}
								className={styles.choiceItem}
							>
								<Checkbox
									checked={
										isLocked || selection.versionIds.includes(version.id)
									}
									disabled={isLocked}
									tooltip={lockReason}
									label={
										<span className={styles.optionWithTag}>
											<strong>{version.title ?? game.name}</strong>
											{version.isOriginal && (
												<span className={styles.tag}>Originale</span>
											)}
										</span>
									}
									description={
										<VersionPlatformDates platforms={version.platforms} />
									}
									onChange={() =>
										onSelectionChange({
											...selection,
											versionIds: toggleId(selection.versionIds, version.id),
										})
									}
								/>
							</li>
						);
					})}
				</ul>
			</section>

			<section>
				<SectionTitle count={`${checkedDlcCount} / ${dlcs.length}`}>
					DLC à enregistrer
				</SectionTitle>
				{dlcs.length === 0 ? (
					<p className={styles.emptyHint}>Aucun DLC</p>
				) : (
					<ul className={styles.choiceList}>
						{dlcs.map(({ id, name, isStored, storedGameId }) => (
							<li
								key={id}
								className={joinClassNames(styles.choiceItem, styles.dlcChoice)}
							>
								<Checkbox
									checked={isStored || selection.dlcIds.includes(id)}
									disabled={isStored}
									tooltip={isStored ? "Déjà en base" : null}
									label={name}
									onChange={() =>
										onSelectionChange({
											...selection,
											dlcIds: toggleId(selection.dlcIds, id),
										})
									}
								/>
								{/* Indépendante de la case DLC : un DLC peut être les deux */}
								<Checkbox
									variant="chip"
									icon={Puzzle}
									label="Comme jeu"
									ariaLabel={`${name} : comme jeu`}
									checked={selection.dlcAsGameIds.includes(id)}
									disabled={storedGameId !== null}
									tooltip={
										storedGameId === null
											? "Après « Valider », ouvre l’ajout de ce DLC comme jeu à part ; il peut rester DLC en même temps"
											: "Déjà en base comme jeu"
									}
									onChange={() =>
										onSelectionChange({
											...selection,
											dlcAsGameIds: toggleId(selection.dlcAsGameIds, id),
										})
									}
								/>
							</li>
						))}
					</ul>
				)}
			</section>

			{warnings.length > 0 && (
				<Callout tone="warning">
					<p className={styles.calloutTitle}>
						Données IGDB hors modèle ({warnings.length})
					</p>
					{warnings.map(({ igdbId, message, entryJson }) => (
						<details
							key={igdbId}
							className={styles.warningDetails}
						>
							<summary>{message}</summary>
							<pre>{entryJson}</pre>
						</details>
					))}
				</Callout>
			)}
		</div>
	);
}
