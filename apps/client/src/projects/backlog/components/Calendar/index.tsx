import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { useEffect, useRef } from "react";

import type { IsoDate } from "../../types";
import { joinClassNames } from "../../utils";
import styles from "./calendar.module.scss";
import { useCalendar } from "./useCalendar";

type Props = {
	/** Le jour sélectionné ; le calendrier s'ouvre sur son mois, ou sur celui du jour */
	value: IsoDate | null;
	onSelect: (date: IsoDate) => void;
	onClose: () => void;
};

const weekdays = [
	{ short: "L", long: "lundi" },
	{ short: "M", long: "mardi" },
	{ short: "M", long: "mercredi" },
	{ short: "J", long: "jeudi" },
	{ short: "V", long: "vendredi" },
	{ short: "S", long: "samedi" },
	{ short: "D", long: "dimanche" },
];

const dayFormat = new Intl.DateTimeFormat("fr-FR", {
	dateStyle: "full",
	timeZone: "UTC",
});

/** Calendrier d'un mois, semaine du lundi au dimanche ; au clavier, voir `useCalendar` */
export function Calendar({ value, onSelect, onClose }: Props) {
	const gridRef = useRef<HTMLTableElement>(null);
	const {
		focusedDate,
		monthLabel,
		weeks,
		today,
		showPreviousMonth,
		showNextMonth,
		showPreviousYear,
		showNextYear,
		handleKeyDown,
	} = useCalendar({ value, onSelect, onClose });

	// Le jour actif prend le focus à l'ouverture et quand il change (flèches, autre mois)
	useEffect(() => {
		gridRef.current
			?.querySelector<HTMLButtonElement>(`[data-date="${focusedDate}"]`)
			?.focus({ preventScroll: true });
	}, [focusedDate]);

	const navigation = [
		{
			label: "Année précédente",
			icon: ChevronsLeft,
			onClick: showPreviousYear,
		},
		{ label: "Mois précédent", icon: ChevronLeft, onClick: showPreviousMonth },
	];
	const nextNavigation = [
		{ label: "Mois suivant", icon: ChevronRight, onClick: showNextMonth },
		{ label: "Année suivante", icon: ChevronsRight, onClick: showNextYear },
	];

	return (
		<div className={styles.calendar}>
			<div className={styles.header}>
				{navigation.map(({ label, icon: Icon, onClick }) => (
					<button
						key={label}
						type="button"
						tabIndex={-1}
						className={styles.navButton}
						aria-label={label}
						onClick={onClick}
					>
						<Icon aria-hidden />
					</button>
				))}
				<span
					className={styles.monthLabel}
					aria-live="polite"
				>
					{monthLabel}
				</span>
				{nextNavigation.map(({ label, icon: Icon, onClick }) => (
					<button
						key={label}
						type="button"
						tabIndex={-1}
						className={styles.navButton}
						aria-label={label}
						onClick={onClick}
					>
						<Icon aria-hidden />
					</button>
				))}
			</div>
			<table
				ref={gridRef}
				role="grid"
				aria-label={monthLabel}
				className={styles.grid}
				onKeyDown={handleKeyDown}
			>
				<thead>
					<tr>
						{weekdays.map(({ short, long }) => (
							<th
								key={long}
								scope="col"
								abbr={long}
							>
								{short}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{weeks.map((week) => (
						<tr key={week.at(0)?.date}>
							{week.map(({ date, day, isInMonth }) => (
								<td
									key={date}
									role="gridcell"
									aria-selected={date === value}
								>
									<button
										type="button"
										data-date={date}
										tabIndex={date === focusedDate ? 0 : -1}
										className={joinClassNames(
											styles.day,
											!isInMonth && styles.outsideMonth,
											date === today && styles.today,
											date === value && styles.selected,
										)}
										aria-label={dayFormat.format(new Date(`${date}T00:00:00Z`))}
										aria-current={date === today ? "date" : undefined}
										onClick={() => onSelect(date)}
									>
										{day}
									</button>
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
			<div className={styles.footer}>
				<button
					type="button"
					tabIndex={-1}
					className={styles.todayButton}
					onClick={() => onSelect(today)}
				>
					Aujourd’hui
				</button>
			</div>
		</div>
	);
}
