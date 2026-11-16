import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";
import { Film, Tv } from "lucide-react";

import { Tooltip } from "../../../../components/Tooltip";
import { mediaTypeLabels } from "../../../../helper/label/mediaTypeLabels";
import mediaStyles from "../../../../media.module.scss";

// Film ou série, en icône ; le libellé en info-bulle et pour les lecteurs d'écran
export function MediaTypeIcon({ mediaType }: { mediaType: MediaTypeEnum }) {
	const Icon = mediaType === MediaTypeEnum.MOVIE ? Film : Tv;
	const label = mediaTypeLabels[mediaType];
	return (
		<Tooltip content={label}>
			<span
				className={mediaStyles.typeIcon}
				role="img"
				aria-label={label}
			>
				<Icon aria-hidden />
			</span>
		</Tooltip>
	);
}
