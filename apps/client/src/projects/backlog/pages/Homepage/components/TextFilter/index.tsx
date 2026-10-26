import type { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/rule/view/columnFilter.type";
import { useState } from "react";

import styles from "../../../../backlog.module.scss";
import { Tooltip } from "../../../../components/Tooltip";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";
import { UiDelayEnum } from "../../../../helper/timing/uiDelay.enum";
import { useDebouncedCallback } from "../../../../hooks/useDebouncedCallback";

type Props = {
	column: BacklogColumnEnum;
	filter: Extract<ColumnFilter, { kind: ColumnFilterKindEnum.TEXT }> | null;
	label: string;
	onChange: (filter: ColumnFilter | null) => void;
};

/**
 * « Contient… » : la saisie s'affiche tout de suite, le tableau se relit une fois la frappe arrêtée. Un filtre posé
 * ailleurs (clic sur une série) remplace la saisie
 */
export function TextFilter({ column, filter, label, onChange }: Props) {
	const filterText = filter?.text ?? "";
	const [text, setText] = useState(filterText);
	const [syncedText, setSyncedText] = useState(filterText);
	if (filterText !== syncedText) {
		setSyncedText(filterText);
		setText(filterText);
	}
	const changeLater = useDebouncedCallback(
		onChange,
		UiDelayEnum.TYPING_DEBOUNCE,
	);

	return (
		<span
			className={joinClassNames(
				styles.textFilter,
				filter !== null && styles.activeFilter,
			)}
		>
			{filter?.isExact === true && (
				<Tooltip content="Valeur exacte, après un clic sur une série">
					<span className={styles.exactMark}>=</span>
				</Tooltip>
			)}
			<input
				type="search"
				// Sans largeur propre : le champ prend celle de sa colonne, sans l'élargir
				size={1}
				className={styles.filterInput}
				placeholder="Contient…"
				aria-label={label}
				value={text}
				onChange={(event) => {
					const nextText = event.target.value;
					setText(nextText);
					changeLater(
						nextText.trim() === ""
							? null
							: {
									column,
									kind: ColumnFilterKindEnum.TEXT,
									text: nextText,
									isExact: false,
								},
					);
				}}
			/>
		</span>
	);
}
