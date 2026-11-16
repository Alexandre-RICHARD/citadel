import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import { Library, TriangleAlert } from "lucide-react";

import { isCollectionMismatch } from "../../../../helper/nas/isCollectionMismatch";
import nasStyles from "../../../../nas.module.scss";

type Props = {
	sagaName: string | null;
	// La collection Jellyfin du média ; null en mode classique ou sans collection
	collection: string | null;
};

// Sous la saga, en mode connecté : la collection Jellyfin, signalée quand son nom diffère de celui de la saga (§5)
export function JellyfinCollectionNote({ sagaName, collection }: Props) {
	if (collection === null) return null;
	const isMismatch = isCollectionMismatch(sagaName, collection);
	const Icon = isMismatch ? TriangleAlert : Library;
	return (
		<span
			className={joinClassNames(
				nasStyles.collectionNote,
				isMismatch && nasStyles.collectionMismatch,
			)}
			title={
				isMismatch
					? "La collection Jellyfin ne porte pas le nom de la saga"
					: "Collection Jellyfin"
			}
		>
			<Icon aria-hidden />
			{collection}
		</span>
	);
}
