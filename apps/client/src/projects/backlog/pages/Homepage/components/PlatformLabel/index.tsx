import { Cpu } from "lucide-react";

import type { PlatformFm } from "../../../../api/model/platformFm.type";
import styles from "../../../../backlog.module.scss";
import { Tooltip } from "../../../../components/Tooltip";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";

// Icônes embarquées dans `icons/` du projet, nommées par le nom technique de leur plateforme (ex. `ps2.svg`)
const platformIconUrls = import.meta.glob<string>("../../../../icons/*.svg", {
	eager: true,
	query: "?url",
	import: "default",
});

// Plateforme : icône et nom, le nom seul si l'icône manque ; un émulateur est signalé
export function PlatformLabel({ platform }: { platform: PlatformFm }) {
	const iconUrl: string | undefined =
		platformIconUrls[`../../../../icons/${platform.technicalName}.svg`];
	const isEmulator = platform.emulatedPlatformId !== null;
	return (
		<Tooltip content={isEmulator ? "Émulateur" : null}>
			<span
				className={joinClassNames(
					styles.platform,
					isEmulator && styles.emulator,
				)}
			>
				{iconUrl === undefined ? (
					isEmulator && <Cpu aria-hidden />
				) : (
					<img
						src={iconUrl}
						alt=""
					/>
				)}
				{platform.shortName}
			</span>
		</Tooltip>
	);
}
