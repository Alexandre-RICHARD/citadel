import { IconButton } from "@citadel/design-system/src/atoms/IconButton";
import { LoaderCircle, Play, RotateCw, ScrollText, Square } from "lucide-react";

import { isRunningState } from "../../../shared/isRunningState";
import { ServiceActionEnum } from "../../../shared/serviceAction.enum";
import type { ServiceItem } from "../../../shared/serviceItem.type";
import { formatBytes } from "../../format/formatBytes";
import { formatDuration } from "../../format/formatDuration";
import { formatPercent } from "../../format/formatPercent";
import { ACTION_LABELS } from "../../status/actionLabels";
import { serviceStatus } from "../../status/serviceStatus";
import { Meter } from "../Meter";
import { StatusDot } from "../StatusDot";
import styles from "./serviceRow.module.scss";

type Props = {
	service: ServiceItem;
	// Une action tourne sur ce service : roue à la place des boutons
	pending: boolean;
	// Une action tourne ailleurs : boutons inactifs
	disabled: boolean;
	// Heure de la dernière lecture des services, pour « allumé depuis »
	now: number;
	onAction: (action: ServiceActionEnum) => void;
	onShowLogs: () => void;
};

function memoryText(service: ServiceItem): string {
	if (service.memoryBytes === null) return "–";
	const used = formatBytes(service.memoryBytes);
	return service.memoryLimitBytes === null
		? used
		: `${used} / ${formatBytes(service.memoryLimitBytes)}`;
}

export function ServiceRow({
	service,
	pending,
	disabled,
	now,
	onAction,
	onShowLogs,
}: Props) {
	const status = serviceStatus(service);
	const running = isRunningState(service.state);
	const since =
		service.startedAt === null
			? null
			: formatDuration((now - Date.parse(service.startedAt)) / 1000);
	const actions = running
		? [ServiceActionEnum.RESTART, ServiceActionEnum.STOP]
		: [ServiceActionEnum.START];

	return (
		<li
			className={styles.serviceRow}
			data-running={running}
		>
			<div className={styles.identity}>
				<StatusDot
					tone={status.tone}
					label={status.text}
				/>
				<div className={styles.names}>
					<span className={styles.name}>{service.label}</span>
					<span className={styles.description}>{service.description}</span>
				</div>
			</div>

			<div className={styles.state}>
				<span>{status.text}</span>
				{since ? <span className={styles.muted}>{since}</span> : null}
				{service.restartCount > 0 ? (
					<span
						className={styles.restarts}
						title="Redémarrages automatiques depuis sa création"
					>
						{`↻ ${service.restartCount}`}
					</span>
				) : null}
			</div>

			<div className={styles.usage}>
				<span
					className={styles.cpu}
					title="Processeur (100 % = un cœur)"
				>
					{running ? formatPercent(service.cpuPercent) : "–"}
				</span>
				<div className={styles.memory}>
					<span className={styles.memoryText}>{memoryText(service)}</span>
					{service.memoryBytes !== null && service.memoryLimitBytes !== null ? (
						<Meter
							label={`Mémoire de ${service.label}`}
							ratio={service.memoryBytes / service.memoryLimitBytes}
							valueText={memoryText(service)}
							compact
						/>
					) : null}
				</div>
			</div>

			<span
				className={styles.version}
				title={service.image}
			>
				{service.version}
			</span>

			<div className={styles.actions}>
				{pending ? (
					<span
						className={styles.spinner}
						role="status"
						aria-label="Action en cours"
					>
						<LoaderCircle size={17} />
					</span>
				) : null}
				{!pending && service.controllable
					? actions.map((action) => (
							<IconButton
								key={action}
								icon={
									{
										[ServiceActionEnum.START]: Play,
										[ServiceActionEnum.STOP]: Square,
										[ServiceActionEnum.RESTART]: RotateCw,
									}[action]
								}
								label={`${ACTION_LABELS[action].verb} ${service.label}`}
								variant={
									action === ServiceActionEnum.STOP ? "destructive" : "ghost"
								}
								size="sm"
								disabled={disabled}
								onClick={() => onAction(action)}
							/>
						))
					: null}
				<IconButton
					icon={ScrollText}
					label={`Logs de ${service.label}`}
					size="sm"
					onClick={onShowLogs}
				/>
			</div>
		</li>
	);
}
