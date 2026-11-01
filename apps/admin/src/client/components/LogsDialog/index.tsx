import { IconButton } from "@citadel/design-system/src/atoms/IconButton";
import { RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { apiRequest } from "../../api/apiRequest";
import styles from "./logsDialog.module.scss";

type Props = {
	// Ce qu'on lit : un titre, la route de l'API, une précision ; null : fermée
	target: { title: string; path: string; hint: string } | null;
	onClose: () => void;
};

// Des logs (un conteneur, le dernier passage d'un job), relus à la demande
export function LogsDialog({ target, onClose }: Props) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const preRef = useRef<HTMLPreElement>(null);
	const [logs, setLogs] = useState<string>("");
	const [loading, setLoading] = useState(false);

	const load = useCallback(async (path: string) => {
		setLoading(true);
		try {
			setLogs((await apiRequest<string>(path)) || "(aucune ligne)");
		} catch (error) {
			setLogs(error instanceof Error ? error.message : String(error));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (target && !dialog.open) {
			setLogs("");
			dialog.showModal();
			void load(target.path);
		}
		if (!target && dialog.open) dialog.close();
	}, [target, load]);

	// Les lignes les plus récentes sont en bas : on y descend
	useEffect(() => {
		preRef.current?.scrollTo({ top: preRef.current.scrollHeight });
	}, [logs]);

	return (
		<dialog
			ref={dialogRef}
			className={styles.logsDialog}
			aria-label={target?.title ?? "Logs"}
			onCancel={(event) => {
				event.preventDefault();
				onClose();
			}}
		>
			<header className={styles.header}>
				<h2 className={styles.title}>{target?.title ?? "Logs"}</h2>
				<span className={styles.hint}>{target?.hint}</span>
				<IconButton
					icon={RefreshCw}
					label="Relire"
					size="sm"
					disabled={loading || !target}
					onClick={() => {
						if (target) void load(target.path);
					}}
				/>
				<IconButton
					icon={X}
					label="Fermer"
					size="sm"
					onClick={onClose}
				/>
			</header>
			<pre
				ref={preRef}
				className={styles.logs}
				aria-busy={loading}
			>
				{loading && !logs ? "Lecture…" : logs}
			</pre>
		</dialog>
	);
}
