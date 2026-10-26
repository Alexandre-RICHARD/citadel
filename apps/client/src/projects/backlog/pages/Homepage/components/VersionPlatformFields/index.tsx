import type { StoredVersionFm } from "../../../../api/model/storedVersionFm.type";
import styles from "../../../../backlog.module.scss";
import { Select } from "../../../../components/Select";
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

// Version puis plateforme d'une nouvelle version jouée : plateformes de la version, puis émulateurs de ces consoles
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

	return (
		<div className={styles.formRow}>
			<FormField
				label="Version"
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
			<FormField label="Plateforme">
				<Select
					value={platformId === null ? null : String(platformId)}
					options={platformOptions.map((platform) => {
						const isTaken = takenVersionPlatforms.some(
							(taken) =>
								taken.versionId === versionId &&
								taken.platformId === platform.id,
						);
						let hint: string | undefined;
						if (isTaken) hint = "déjà dans le backlog";
						else if (platform.emulatedPlatformId !== null) hint = "émulateur";
						return {
							value: String(platform.id),
							label: platform.shortName,
							hint,
							disabled: isTaken,
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
		</div>
	);
}
