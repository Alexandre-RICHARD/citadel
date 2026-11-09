import { useWheelStep } from "@citadel/common/src/react/hooks/useWheelStep";
import type { IsoDate } from "@citadel/common/src/universal/date/isoDate.type";
import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";

import styles from "./calendar.module.scss";
import { NavButton } from "./NavButton";
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
	const monthRowRef = useRef<HTMLDivElement>(null);
	const yearRowRef = useRef<HTMLDivElement>(null);
	const {
		focusedDate,
		monthName,
		yearLabel,
		weeks,
		today,
		showPreviousMonth,
		showNextMonth,
		showPreviousYear,
		showNextYear,
		handleKeyDown,
	} = useCalendar({ value, onSelect, onClose });
	const monthLabel = `${monthName} ${yearLabel}`;

	// La molette change le mois ou l'année, vers le bas : plus tard
	useWheelStep(monthRowRef, (step) =>
		step === 1 ? showNextMonth() : showPreviousMonth(),
	);
	useWheelStep(yearRowRef, (step) =>
		step === 1 ? showNextYear() : showPreviousYear(),
	);

	// Le jour actif prend le focus à l'ouverture et quand il change (flèches, autre mois)
	useEffect(() => {
		gridRef.current
			?.querySelector<HTMLButtonElement>(`[data-date="${focusedDate}"]`)
			?.focus({ preventScroll: true });
	}, [focusedDate]);

	return (
		<div className={styles.calendar}>
			{/* Mois et année, chacun sur sa ligne : les flèches ou la molette (vers le bas : plus tard) les changent */}
			<div
				ref={monthRowRef}
				className={styles.header}
				title="Molette : changer de mois"
			>
				<NavButton
					label="Mois précédent"
					icon={ChevronLeft}
					onClick={showPreviousMonth}
				/>
				<span
					className={joinClassNames(styles.headerLabel, styles.monthName)}
					aria-live="polite"
				>
					{monthName}
				</span>
				<NavButton
					label="Mois suivant"
					icon={ChevronRight}
					onClick={showNextMonth}
				/>
			</div>
			<div
				ref={yearRowRef}
				className={styles.header}
				title="Molette : changer d'année"
			>
				<NavButton
					label="Année précédente"
					icon={ChevronLeft}
					onClick={showPreviousYear}
				/>
				<span
					className={styles.headerLabel}
					aria-live="polite"
				>
					{yearLabel}
				</span>
				<NavButton
					label="Année suivante"
					icon={ChevronRight}
					onClick={showNextYear}
				/>
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
