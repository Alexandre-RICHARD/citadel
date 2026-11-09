import type { StoredVersionFm } from "../../../../api/model/storedVersionFm.type";
import styles from "../../../../backlog.module.scss";
import { Select } from "../../../../components/Select";
import { getSubPlatformFieldLabel } from "../../../../helper/platform/getSubPlatformFieldLabel";
import { splitPlatformChoice } from "../../../../helper/platform/splitPlatformChoice";
import { FormField } from "../FormField";

type Props = {
	gameName: string;
	versions: StoredVersionFm[];
	// Couples déjà joués : grisés
	takenVersionPlatforms: { versionId: number; platformId: number }[];
	versionId: number | null;
	platformId: number | null;
	onChange: (versionId: number, platformId: number | null) => void;
};

// Valeur du second choix qui laisse la plateforme elle-même
const NO_SUB_PLATFORM = "";

// Libellé d'une version : son titre, ou le nom du jeu pour l'originale, puis ses plateformes
function getVersionLabel(version: StoredVersionFm, gameName: string): string {
	const title = version.title ?? `${gameName} (originale)`;
	const platformNames = version.platforms.map(
		({ platform }) => platform.shortName,
	);
	return platformNames.length === 0
		? title
		: `${title} · ${platformNames.join(", ")}`;
}

/**
 * Version, plateforme, puis, si la plateforme en a, sa sous-plateforme (RPCS3 pour la PS3, Steam pour le PC) : celle
 * choisie est enregistrée, sinon la plateforme
 */
export function VersionPlatformFields({
	gameName,
	versions,
	takenVersionPlatforms,
	versionId,
	platformId,
	onChange,
}: Props) {
	const platformOptions =
		versions.find(({ id }) => id === versionId)?.platformOptions ?? [];
	const { platforms, parentId, subPlatforms, subPlatformId } =
		splitPlatformChoice(platformOptions, platformId);

	function isTaken(candidatePlatformId: number): boolean {
		return takenVersionPlatforms.some(
			(taken) =>
				taken.versionId === versionId &&
				taken.platformId === candidatePlatformId,
		);
	}

	return (
		<div className={styles.formRow}>
			<FormField
				label="Version"
				isRequired
				className={styles.versionField}
			>
				<Select
					value={versionId === null ? null : String(versionId)}
					options={versions.map((version) => ({
						value: String(version.id),
						label: getVersionLabel(version, gameName),
					}))}
					placeholder="Choisir la version"
					ariaLabel="Version"
					className={styles.fullWidth}
					onChange={(value) => onChange(Number(value), null)}
				/>
			</FormField>
			<FormField
				label="Plateforme"
				isRequired
			>
				<Select
					value={parentId === null ? null : String(parentId)}
					options={platforms.map((platform) => {
						const hasSubPlatforms = platformOptions.some(
							({ parentPlatformId }) => parentPlatformId === platform.id,
						);
						// Une plateforme déjà jouée reste choisissable tant que l'une de ses sous-plateformes ne l'est pas
						const isExhausted =
							isTaken(platform.id) &&
							!platformOptions.some(
								(option) =>
									option.parentPlatformId === platform.id &&
									!isTaken(option.id),
							);
						return {
							value: String(platform.id),
							label: platform.shortName,
							hint:
								isExhausted && !hasSubPlatforms
									? "déjà dans le backlog"
									: undefined,
							disabled: isExhausted,
						};
					})}
					placeholder={
						versionId === null ? "D’abord la version" : "Choisir la plateforme"
					}
					ariaLabel="Plateforme"
					disabled={versionId === null}
					className={styles.fullWidth}
					onChange={(value) => {
						if (versionId !== null) onChange(versionId, Number(value));
					}}
				/>
			</FormField>
			{subPlatforms.length > 0 && (
				<FormField label={getSubPlatformFieldLabel(subPlatforms)}>
					<Select
						value={
							subPlatformId === null ? NO_SUB_PLATFORM : String(subPlatformId)
						}
						options={[
							{
								value: NO_SUB_PLATFORM,
								label: "Aucun",
								disabled: parentId !== null && isTaken(parentId),
								hint:
									parentId !== null && isTaken(parentId)
										? "déjà dans le backlog"
										: undefined,
							},
							...subPlatforms.map((subPlatform) => ({
								value: String(subPlatform.id),
								label: subPlatform.shortName,
								hint: isTaken(subPlatform.id)
									? "déjà dans le backlog"
									: undefined,
								disabled: isTaken(subPlatform.id),
							})),
						]}
						ariaLabel={getSubPlatformFieldLabel(subPlatforms)}
						className={styles.fullWidth}
						onChange={(value) => {
							if (versionId === null || parentId === null) return;
							onChange(
								versionId,
								value === NO_SUB_PLATFORM ? parentId : Number(value),
							);
						}}
					/>
				</FormField>
			)}
		</div>
	);
}
