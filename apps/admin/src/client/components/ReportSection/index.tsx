import { type ReactNode, useState } from "react";

import styles from "./reportSection.module.scss";

type Props = {
	title: string;
	// Le nombre à côté du titre (« 46 · 212 Go »)
	count: string;
	tone: "danger" | "warn" | "idle" | "accent";
	description: string;
	// Une ligne de résumé au-dessus de la liste (trackers, étiquettes)
	summary?: ReactNode;
	// Les lignes ; au-delà de `visibleCount`, « Voir les N autres »
	rows: ReactNode[];
	visibleCount?: number;
	// Quand la liste est vide
	emptyText: string;
};

// Une partie du rapport : titre, nombre, ce qu'elle veut dire, puis ses lignes. Rien ne s'y supprime : cela se fait dans
// qBittorrent ou sur le disque
export function ReportSection({
	title,
	count,
	tone,
	description,
	summary,
	rows,
	visibleCount = 3,
	emptyText,
}: Props) {
	const [isExpanded, setIsExpanded] = useState(false);
	const hiddenCount = isExpanded ? 0 : Math.max(0, rows.length - visibleCount);
	return (
		<section
			className={styles.section}
			aria-label={title}
		>
			<header className={styles.header}>
				<h2 className={styles.title}>{title}</h2>
				<span
					className={styles.count}
					data-tone={tone}
				>
					{count}
				</span>
				<p className={styles.description}>{description}</p>
			</header>
			{summary === undefined ? null : (
				<div className={styles.summary}>{summary}</div>
			)}
			{rows.length === 0 ? (
				<p className={styles.empty}>{emptyText}</p>
			) : (
				<ul className={styles.rows}>
					{rows.slice(0, rows.length - hiddenCount)}
				</ul>
			)}
			{hiddenCount === 0 ? null : (
				<button
					type="button"
					className={styles.more}
					onClick={() => setIsExpanded(true)}
				>
					{hiddenCount === 1
						? "Voir l'autre"
						: `Voir les ${hiddenCount} autres`}
				</button>
			)}
		</section>
	);
}
