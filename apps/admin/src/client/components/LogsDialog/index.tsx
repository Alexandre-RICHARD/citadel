import { IconButton } from "@citadel/design-system/src/atoms/IconButton";
import { RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ServiceItem } from "../../../shared/serviceItem.type";
import { apiRequest } from "../../api/apiRequest";
import styles from "./logsDialog.module.scss";

type Props = {
	// null : fermée
	service: ServiceItem | null;
	onClose: () => void;
};

// Les 200 dernières lignes de logs d'un conteneur, relues à la demande
export function LogsDialog({ service, onClose }: Props) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const preRef = useRef<HTMLPreElement>(null);
	const [logs, setLogs] = useState<string>("");
	const [loading, setLoading] = useState(false);

	const load = useCallback(async (name: string) => {
		setLoading(true);
		try {
			setLogs(
				(await apiRequest<string>(`/services/${name}/logs`)) ||
					"(aucune ligne)",
			);
		} catch (error) {
			setLogs(error instanceof Error ? error.message : String(error));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (service && !dialog.open) {
			setLogs("");
			dialog.showModal();
			void load(service.name);
		}
		if (!service && dialog.open) dialog.close();
	}, [service, load]);

	// Les lignes les plus récentes sont en bas : on y descend
	useEffect(() => {
		preRef.current?.scrollTo({ top: preRef.current.scrollHeight });
	}, [logs]);

	return (
		<dialog
			ref={dialogRef}
			className={styles.logsDialog}
			aria-label={service ? `Logs de ${service.label}` : "Logs"}
			onCancel={(event) => {
				event.preventDefault();
				onClose();
			}}
		>
			<header className={styles.header}>
				<h2 className={styles.title}>
					{service ? `Logs · ${service.label}` : "Logs"}
				</h2>
				<span className={styles.hint}>200 dernières lignes</span>
				<IconButton
					icon={RefreshCw}
					label="Relire"
					size="sm"
					disabled={loading || !service}
					onClick={() => {
						if (service) void load(service.name);
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
