import { formatLongDate } from "@citadel/common/src/universal/date/formatLongDate";
import { useEffect, useRef } from "react";

import globalStyles from "../../../../globalStyles.module.scss";
import styles from "./blockTitle.module.scss";

type Props = {
	editing: boolean;
	draftName: string;
	setDraftName: (newName: string) => void;
	// Règle enfreinte par le nom saisi, affichée sous le champ à la place des dates
	inputError: string | null;
	onToggleExpand: () => void;
	element: {
		name: string;
		startedAt: string | null;
		endedAt: string | null;
	};
};

export function BlockTitle({
	editing,
	draftName,
	setDraftName,
	inputError,
	onToggleExpand,
	element,
}: Props) {
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (editing) {
			inputRef.current?.focus();
		}
	}, [editing]);

	return (
		<div className={styles.nameAndMetaBlock}>
			{editing ? (
				<input
					ref={inputRef}
					type="text"
					value={draftName}
					onChange={(e) => setDraftName(e.target.value)}
					aria-invalid={inputError !== null}
					className={`${globalStyles.fieldInput} ${globalStyles.fieldInputInlineTitle} ${globalStyles.fieldInputGame}`}
				/>
			) : (
				<button
					type="button"
					className={styles.name}
					onClick={onToggleExpand}
				>
					{element.name}
				</button>
			)}
			{editing && inputError !== null ? (
				<p className={globalStyles.inputError}>{inputError}</p>
			) : (
				<span className={styles.meta}>
					{Boolean(element.startedAt) && (
						<>Débuté le {formatLongDate(element.startedAt)}</>
					)}
					{Boolean(element.endedAt) && (
						<> · terminé le {formatLongDate(element.endedAt)}</>
					)}
				</span>
			)}
		</div>
	);
}
