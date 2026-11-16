import type { CSSProperties } from "react";

import styles from "./reportRow.module.scss";

type Props = {
	// La première cellule, la plus large (nom du torrent, chemin du fichier)
	name: string;
	cells: (string | null)[];
	// Une étiquette de qualité (4K, FHD…) avant les autres cellules
	tag?: string | null;
};

// Une ligne d'une partie du rapport : un nom, puis des cellules plus courtes
export function ReportRow({ name, cells, tag }: Props) {
	return (
		<li
			className={styles.row}
			style={
				{
					"--cells": cells.length + (tag === undefined ? 0 : 1),
				} as CSSProperties
			}
		>
			<span
				className={styles.name}
				title={name}
			>
				{name}
			</span>
			{tag === undefined ? null : (
				<span className={styles.tag}>{tag ?? "–"}</span>
			)}
			{cells.map((cell, index) => (
				<span
					// Des cellules sans identité propre : leur place suffit
					// eslint-disable-next-line react/no-array-index-key
					key={index}
					className={styles.cell}
				>
					{cell ?? "–"}
				</span>
			))}
		</li>
	);
}
