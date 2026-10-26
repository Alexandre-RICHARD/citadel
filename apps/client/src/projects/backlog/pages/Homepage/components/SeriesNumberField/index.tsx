import { formatSeriesNumber } from "@citadel/specs/src/projects/backlog/rule/seriesNumber/formatSeriesNumber";
import { parseSeriesNumber } from "@citadel/specs/src/projects/backlog/rule/seriesNumber/parseSeriesNumber";
import type { SeriesEntry } from "@citadel/specs/src/projects/backlog/rule/seriesNumber/seriesEntry.type";

import styles from "../../../../backlog.module.scss";
import { blurOnEnter } from "../../../../helper/dom/blurOnEnter";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";

type Props = {
	value: number | null;
	// Les autres jeux de la série : ils servent à lire et à afficher le numéro
	entries: SeriesEntry[];
	// Chaque frappe valable est prise ; sinon, le numéro l'est en quittant le champ, ou avec Entrée
	isLive: boolean;
	// Affiché sans numéro, ex. le prochain numéro libre
	placeholder?: string | undefined;
	className?: string;
	ariaLabel?: string;
	onCommit: (seriesNumber: number) => void;
};

/**
 * Numéro dans la série, tapé « 3 » ou « 3.1 ». Un numéro refusé (sous 1, plus de 3 décimales)
 * remet le champ au dernier numéro accepté
 */
export function SeriesNumberField({
	value,
	entries,
	isLive,
	placeholder,
	className,
	ariaLabel,
	onCommit,
}: Props) {
	const text = value === null ? "" : formatSeriesNumber(value, entries);
	return (
		<input
			// Pris à la sortie du champ : le champ repart du numéro rangé
			key={isLive ? undefined : text}
			type="text"
			inputMode="decimal"
			className={joinClassNames(styles.seriesNumberField, className)}
			aria-label={ariaLabel}
			defaultValue={text}
			placeholder={placeholder}
			onKeyDown={blurOnEnter}
			onChange={(event) => {
				const seriesNumber = parseSeriesNumber(event.target.value, entries);
				if (isLive && seriesNumber !== null) onCommit(seriesNumber);
			}}
			onBlur={(event) => {
				const input = event.currentTarget;
				const seriesNumber = parseSeriesNumber(input.value, entries);
				if (seriesNumber === null) input.value = text;
				else if (!isLive && seriesNumber !== value) onCommit(seriesNumber);
			}}
		/>
	);
}
