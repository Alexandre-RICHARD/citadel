import { ImageOff } from "lucide-react";

import styles from "../../../../backlog.module.scss";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";
import { getIgdbImageUrl } from "../../../../helper/image/getIgdbImageUrl";
import { IgdbImageSizeEnum } from "../../../../helper/image/igdbImageSize.enum";

// Jaquette de la modale du jeu : `t_cover_small`, en portrait
export function Cover({ imageId }: { imageId: string | null }) {
	if (imageId === null)
		return (
			<span className={joinClassNames(styles.cover, styles.coverPlaceholder)}>
				<ImageOff aria-hidden />
			</span>
		);
	return (
		<img
			className={styles.cover}
			src={getIgdbImageUrl(imageId, IgdbImageSizeEnum.COVER_SMALL)}
			srcSet={`${getIgdbImageUrl(imageId, IgdbImageSizeEnum.COVER_SMALL, true)} 2x`}
			alt=""
		/>
	);
}
