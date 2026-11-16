import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import { ImageOff } from "lucide-react";

import { getTmdbImageUrl } from "../../../../helper/media/getTmdbImageUrl";
import { TmdbImageSizeEnum } from "../../../../helper/media/tmdbImageSize.enum";
import mediaStyles from "../../../../media.module.scss";

const sizeClassNames = {
	sm: mediaStyles.posterSm,
	md: mediaStyles.posterMd,
	lg: mediaStyles.posterLg,
	xl: mediaStyles.posterXl,
	still: mediaStyles.still,
};

type Props = {
	// Chemin TMDB de l'image (« /abc.jpg ») ; null : une icône
	path: string | null;
	// Affiche en portrait, de plus en plus grande ; `still` : image d'un épisode, en paysage
	size?: keyof typeof sizeClassNames;
};

// Miniature TMDB, chargée par le navigateur depuis image.tmdb.org ; double largeur pour les écrans haute densité
export function MediaThumbnail({ path, size = "md" }: Props) {
	const className = joinClassNames(mediaStyles.poster, sizeClassNames[size]);
	if (path === null)
		return (
			<span
				className={joinClassNames(className, mediaStyles.posterPlaceholder)}
			>
				<ImageOff aria-hidden />
			</span>
		);
	const isLarge = size === "lg" || size === "xl";
	return (
		<img
			className={className}
			src={getTmdbImageUrl(
				path,
				isLarge || size === "still"
					? TmdbImageSizeEnum.COVER
					: TmdbImageSizeEnum.THUMB,
			)}
			srcSet={
				isLarge || size === "still"
					? undefined
					: `${getTmdbImageUrl(path, TmdbImageSizeEnum.THUMB_2X)} 2x`
			}
			alt=""
			loading="lazy"
		/>
	);
}
