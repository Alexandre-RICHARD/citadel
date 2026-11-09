import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import { SubPlatformTypeEnum } from "@citadel/specs/src/projects/backlog/enum/subPlatformType.enum";
import { Cpu, Gamepad2, type LucideIcon, Store } from "lucide-react";

import type { PlatformFm } from "../../../../api/model/platformFm.type";
import styles from "../../../../backlog.module.scss";
import { Tooltip } from "../../../../components/Tooltip";
import { subPlatformTypeLabels } from "../../../../helper/label/subPlatformTypeLabels";
import { getPlatformIconUrl } from "../../../../helper/platform/getPlatformIconUrl";

// Icône de la plateforme tant que son SVG manque : une par sorte de plateforme
const defaultIcons: Readonly<
	Record<SubPlatformTypeEnum | "platform", LucideIcon>
> = {
	platform: Gamepad2,
	[SubPlatformTypeEnum.EMULATOR]: Cpu,
	[SubPlatformTypeEnum.LAUNCHER]: Store,
};

// Plateforme : son icône (celle par défaut tant que son SVG manque) et son nom ; une sous-plateforme est signalée
export function PlatformLabel({ platform }: { platform: PlatformFm }) {
	const iconUrl = getPlatformIconUrl(platform.technicalName);
	const { subPlatformType } = platform;
	const DefaultIcon = defaultIcons[subPlatformType ?? "platform"];
	return (
		<Tooltip
			content={
				subPlatformType === null ? null : subPlatformTypeLabels[subPlatformType]
			}
		>
			<span
				className={joinClassNames(
					styles.platform,
					subPlatformType !== null && styles.subPlatform,
				)}
			>
				{iconUrl === null ? (
					<DefaultIcon aria-hidden />
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
