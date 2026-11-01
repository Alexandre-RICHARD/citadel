import { IconButton } from "@citadel/design-system/src/atoms/IconButton";
import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import type { RequestItem } from "../../../shared/requestItem.type";
import { apiRequest } from "../../api/apiRequest";
import { stripAnsi } from "../../format/stripAnsi";
import type { StatusTone } from "../../status/statusTone.type";
import { StatusDot } from "../StatusDot";
import styles from "./requestDialog.module.scss";

type Props = {
	// La demande suivie ; null : fermée
	request: { id: string; title: string } | null;
	onClose: () => void;
	// Sous le log, une fois la demande finie : la suite (« Déployer » après le plan…)
	renderFooter?: (request: RequestItem) => ReactNode;
};

// infra-ops relève les demandes toutes les 2 secondes : la console relit au même rythme
const POLL_MS = 2000;

function describe(request: RequestItem | null): {
	tone: StatusTone;
	text: string;
} {
	if (!request) return { tone: "idle", text: "En attente d'infra-ops…" };
	if (request.status === "running") return { tone: "warn", text: "En cours…" };
	if (request.status === "ok") return { tone: "ok", text: "Terminé" };
	return { tone: "danger", text: `Échec (code ${request.exitCode})` };
}

// Une demande à infra-ops (job, plan, déploiement, restauration…), suivie en direct :
// son log s'affiche au fur et à mesure, jusqu'à la fin
export function RequestDialog({ request, onClose, renderFooter }: Props) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const preRef = useRef<HTMLPreElement>(null);
	// Ce qui a été lu, rattaché à sa demande : une nouvelle demande part de zéro, sans
	// remise à zéro à faire
	const [read, setRead] = useState<{
		id: string;
		request: RequestItem | null;
		error: string | null;
	} | null>(null);
	const requestId = request?.id ?? null;
	const current = read?.id === requestId ? read.request : null;
	const error = read?.id === requestId ? read.error : null;

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (requestId && !dialog.open) dialog.showModal();
		if (!requestId && dialog.open) dialog.close();
	}, [requestId]);

	useEffect(() => {
		if (!requestId) return undefined;
		// Une constante : TypeScript la sait non nulle dans les fonctions plus bas
		const id = requestId;
		let cancelled = false;
		let timer: number | undefined;
		async function load(): Promise<void> {
			try {
				const next = await apiRequest<RequestItem | null>(`/requests/${id}`);
				if (cancelled) return;
				setRead({ id, request: next, error: null });
				if (next !== null && next.status !== "running") return;
			} catch (loadError) {
				if (cancelled) return;
				setRead((previous) => ({
					id,
					request: previous?.id === id ? previous.request : null,
					error:
						loadError instanceof Error ? loadError.message : String(loadError),
				}));
			}
			timer = window.setTimeout(() => {
				void load();
			}, POLL_MS);
		}
		void load();
		return () => {
			cancelled = true;
			window.clearTimeout(timer);
		};
	}, [requestId]);

	// Les lignes les plus récentes sont en bas : on y descend
	useEffect(() => {
		preRef.current?.scrollTo({ top: preRef.current.scrollHeight });
	}, [current?.log]);

	const status = describe(current);
	const finished = current !== null && current.status !== "running";

	return (
		<dialog
			ref={dialogRef}
			className={styles.requestDialog}
			aria-label={request?.title ?? "Demande"}
			onCancel={(event) => {
				event.preventDefault();
				onClose();
			}}
		>
			<header className={styles.header}>
				<h2 className={styles.title}>{request?.title}</h2>
				<span className={styles.status}>
					<StatusDot
						tone={status.tone}
						label={status.text}
					/>
					{status.text}
				</span>
				<IconButton
					icon={X}
					label="Fermer"
					size="sm"
					onClick={onClose}
				/>
			</header>
			{error ? <p className={styles.error}>{error}</p> : null}
			<pre
				ref={preRef}
				className={styles.log}
				aria-busy={!finished}
			>
				{current?.log ? stripAnsi(current.log) : "…"}
			</pre>
			{finished && renderFooter ? (
				<footer className={styles.footer}>{renderFooter(current)}</footer>
			) : null}
		</dialog>
	);
}
