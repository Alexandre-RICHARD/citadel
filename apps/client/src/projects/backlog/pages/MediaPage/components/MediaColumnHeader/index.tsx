import { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum";
import { NasColumnEnum } from "@citadel/specs/src/projects/backlog/enum/nasColumn.enum";
import type { ConnectedMediaColumn } from "@citadel/specs/src/projects/backlog/helper/view/connectedMediaColumn.type";
import type { SortCriterion } from "@citadel/specs/src/projects/backlog/helper/view/sortCriterion.type";
import {
	Bookmark,
	Eye,
	ImageIcon,
	Play,
	ShieldCheck,
	Timer,
} from "lucide-react";
import type { ReactNode } from "react";

import styles from "../../../../backlog.module.scss";
import { isSortableColumn } from "../../../../helper/view/isSortableColumn";
import { ColumnHeader } from "../../../Homepage/components/ColumnHeader";
import type { CompactHeader } from "../../../Homepage/components/ColumnHeader/compactHeader.type";
import { useMediaMode } from "../../useMediaMode";

// Bulle explicative de « Vu » : comment se cochent les épisodes d'une série (§5)
const columnHelp: Partial<Record<ConnectedMediaColumn, ReactNode>> = {
	[MediaColumnEnum.WATCHED]: (
		<dl className={styles.helpList}>
			<div>
				<dt>Film, épisode</dt>
				<dd>Vu ou pas vu, rien d’autre.</dd>
			</div>
			<div>
				<dt>Série, saison</dt>
				<dd>
					Vue quand tous ses épisodes diffusés le sont, sinon « 12 / 26 ». La
					cocher coche tous ses épisodes diffusés, après confirmation.
				</dd>
			</div>
			<div>
				<dt>Épisodes à venir, spéciaux</dt>
				<dd>
					Affichés, mais hors de la progression : cocher une série ne les coche
					pas.
				</dd>
			</div>
		</dl>
	),
	[NasColumnEnum.VERIFIED]: (
		<dl className={styles.helpList}>
			<div>
				<dt>Vérifié</dt>
				<dd>
					Vous avez lancé le fichier : bon contenu, bon format, bonne langue.
					Gardé sur le NAS, il tombe quand le fichier est remplacé.
				</dd>
			</div>
			<div>
				<dt>Série, saison</dt>
				<dd>
					Cochée en cascade sur ses épisodes qui ont un seul fichier, après
					confirmation.
				</dd>
			</div>
		</dl>
	),
};

// En-têtes compacts : une icône ou un mot à la place d'un libellé bien plus large que les valeurs
const compactHeaders: Partial<Record<ConnectedMediaColumn, CompactHeader>> = {
	[MediaColumnEnum.THUMBNAIL]: { icon: ImageIcon },
	[MediaColumnEnum.ORIGINAL_LANGUAGE]: { text: "Langue" },
	[MediaColumnEnum.SAGA_NUMBER]: { text: "N°" },
	[MediaColumnEnum.RUNTIME]: { icon: Timer, text: "Durée" },
	[MediaColumnEnum.IN_PROGRESS]: { icon: Play },
	[MediaColumnEnum.WATCHED]: { icon: Eye },
	[MediaColumnEnum.UP_NEXT]: { icon: Bookmark },
	[NasColumnEnum.VERIFIED]: { icon: ShieldCheck },
	[NasColumnEnum.JELLYFIN_COLLECTION]: { text: "Collection" },
	[NasColumnEnum.GB_PER_HOUR]: { text: "Go/h" },
	[MediaColumnEnum.TMDB_ID]: { text: "TMDB" },
	[MediaColumnEnum.ACTIONS]: {},
};

type Props = {
	column: ConnectedMediaColumn;
	sort: SortCriterion<ConnectedMediaColumn>[];
	className: string | undefined;
	onToggleSort: (column: ConnectedMediaColumn) => void;
};

// En-tête d'une colonne du tableau des films et séries
export function MediaColumnHeader({
	column,
	sort,
	className,
	onToggleSort,
}: Props) {
	const { table } = useMediaMode();
	return (
		<ColumnHeader
			column={column}
			label={table.labels[column]}
			compactHeader={compactHeaders[column]}
			help={columnHelp[column]}
			isSortable={isSortableColumn(table, column)}
			sort={sort}
			className={className}
			onToggleSort={onToggleSort}
		/>
	);
}
