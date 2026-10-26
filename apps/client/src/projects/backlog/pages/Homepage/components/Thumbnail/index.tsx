import { ImageOff } from "lucide-react";

import styles from "../../../../backlog.module.scss";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";
import { getIgdbImageUrl } from "../../../../helper/image/getIgdbImageUrl";
import { IgdbImageSizeEnum } from "../../../../helper/image/igdbImageSize.enum";

const sizeClassNames = {
	sm: styles.thumbnailSm,
	md: styles.thumbnailMd,
	lg: styles.thumbnailLg,
};

type Props = {
	imageId: string | null;
	size?: keyof typeof sizeClassNames;
};

// Miniature IGDB : `t_thumb`, et `t_thumb_2x` pour les écrans haute densité ; sans image, une icône
export function Thumbnail({ imageId, size = "md" }: Props) {
	const className = joinClassNames(styles.thumbnail, sizeClassNames[size]);
	if (imageId === null)
		return (
			<span className={joinClassNames(className, styles.thumbnailPlaceholder)}>
				<ImageOff aria-hidden />
			</span>
		);
	return (
		<img
			className={className}
			src={getIgdbImageUrl(imageId, IgdbImageSizeEnum.THUMB)}
			srcSet={`${getIgdbImageUrl(imageId, IgdbImageSizeEnum.THUMB, true)} 2x`}
			alt=""
			loading="lazy"
		/>
	);
}
