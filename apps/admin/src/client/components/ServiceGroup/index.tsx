import { IconButton } from "@citadel/design-system/src/atoms/IconButton";
import { Play, RotateCw, Square } from "lucide-react";

import { isRunningState } from "../../../shared/isRunningState";
import { ServiceActionEnum } from "../../../shared/serviceAction.enum";
import type { ServiceItem } from "../../../shared/serviceItem.type";
import { ACTION_LABELS } from "../../status/actionLabels";
import { GROUP_LABELS } from "../../status/groupLabels";
import { ServiceRow } from "../ServiceRow";
import styles from "./serviceGroup.module.scss";

type Props = {
	group: string;
	services: ServiceItem[];
	// Cible de l'action en cours : un service, ou ce groupe
	pendingTarget: string | null;
	// Heure de la dernière lecture des services
	now: number;
	onServiceAction: (service: ServiceItem, action: ServiceActionEnum) => void;
	onGroupAction: (group: string, action: ServiceActionEnum) => void;
	onShowLogs: (service: ServiceItem) => void;
};

const GROUP_ACTIONS = [
	{ action: ServiceActionEnum.START, icon: Play },
	{ action: ServiceActionEnum.RESTART, icon: RotateCw },
	{ action: ServiceActionEnum.STOP, icon: Square },
];

export function ServiceGroup({
	group,
	services,
	pendingTarget,
	now,
	onServiceAction,
	onGroupAction,
	onShowLogs,
}: Props) {
	const label = GROUP_LABELS[group] ?? group;
	const runningCount = services.filter((service) =>
		isRunningState(service.state),
	).length;
	const controllable = services.some((service) => service.controllable);
	const groupPending = pendingTarget === group;

	return (
		<section
			className={styles.serviceGroup}
			aria-label={label}
		>
			<header className={styles.header}>
				<h3 className={styles.title}>{label}</h3>
				<span className={styles.count}>
					{`${runningCount} / ${services.length} allumés`}
				</span>
				{controllable ? (
					<div className={styles.actions}>
						{GROUP_ACTIONS.map(({ action, icon }) => (
							<IconButton
								key={action}
								icon={icon}
								label={`${ACTION_LABELS[action].verb} tout le groupe ${label}`}
								variant={
									action === ServiceActionEnum.STOP ? "destructive" : "ghost"
								}
								size="sm"
								disabled={pendingTarget !== null}
								onClick={() => onGroupAction(group, action)}
							/>
						))}
					</div>
				) : null}
			</header>
			<ul aria-busy={groupPending}>
				{services.map((service) => (
					<ServiceRow
						key={service.name}
						service={service}
						pending={groupPending || pendingTarget === service.name}
						disabled={pendingTarget !== null}
						now={now}
						onAction={(action) => onServiceAction(service, action)}
						onShowLogs={() => onShowLogs(service)}
					/>
				))}
			</ul>
		</section>
	);
}
