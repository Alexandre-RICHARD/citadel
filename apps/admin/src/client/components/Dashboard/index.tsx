import { IconButton } from "@citadel/design-system/src/atoms/IconButton";
import { ConfirmDialog } from "@citadel/design-system/src/molecules/ConfirmDialog";
import { Toaster } from "@citadel/design-system/src/organisms/Toaster";
import type { ToastItem } from "@citadel/design-system/src/organisms/Toaster/toastItem.type";
import { ToastVariantEnum } from "@citadel/design-system/src/organisms/Toaster/toastVariant.enum";
import { ThemeProvider } from "@citadel/design-system/src/theme/ThemeProvider";
import { Castle, LogOut } from "lucide-react";
import { type ReactNode, useCallback, useRef, useState } from "react";

import type { ActionStep } from "../../../shared/actionStep.type";
import { planServiceAction } from "../../../shared/planServiceAction";
import { ServiceActionEnum } from "../../../shared/serviceAction.enum";
import type { ServiceItem } from "../../../shared/serviceItem.type";
import { apiRequest } from "../../api/apiRequest";
import { usePolling } from "../../api/usePolling";
import { ACTION_LABELS } from "../../status/actionLabels";
import { GROUP_LABELS } from "../../status/groupLabels";
import { AccessSection } from "../AccessSection";
import { DeadlinesCard } from "../DeadlinesCard";
import { LogsDialog } from "../LogsDialog";
import { ServiceGroup } from "../ServiceGroup";
import { SiteCard } from "../SiteCard";
import { SystemCard } from "../SystemCard";
import { TorrentCard } from "../TorrentCard";
import { VersionsTable } from "../VersionsTable";
import { VpnCard } from "../VpnCard";
import styles from "./dashboard.module.scss";

type Props = {
	consoleVersion: string;
	onLogout: () => void;
};

type PendingConfirmation = {
	title: string;
	description: ReactNode;
	destructive: boolean;
	run: () => void;
};

const TOAST_DURATION_MS = 5000;

// Sur les lignes des services, le survol des boutons se détache du fond des cartes
const SERVICES_THEME = { colorSurfaceRaised: "var(--surface-2)" };

function groupServices(services: ServiceItem[]): [string, ServiceItem[]][] {
	const groups = new Map<string, ServiceItem[]>();
	for (const service of services)
		groups.set(service.group, [...(groups.get(service.group) ?? []), service]);
	return [...groups];
}

// Ce que l'action va vraiment faire, services entraînés compris
function describeSteps(
	steps: ActionStep[],
	byName: Map<string, ServiceItem>,
): ReactNode {
	function labelsOf(operation: ActionStep["operation"]): string[] {
		return steps
			.filter((step) => step.operation === operation)
			.map((step) => byName.get(step.name)?.label ?? step.name);
	}
	const stopped = labelsOf("stop");
	const started = labelsOf("start");
	const alwaysOn = steps
		.map((step) => byName.get(step.name))
		.filter((service) => service?.mode === "always")
		.map((service) => service?.label);

	return (
		<>
			{stopped.length > 0 ? <p>{`Arrêt : ${stopped.join(", ")}.`}</p> : null}
			{started.length > 0 ? (
				<p>{`Démarrage : ${started.join(", ")}.`}</p>
			) : null}
			{alwaysOn.length > 0 ? (
				<p>{`${[...new Set(alwaysOn)].join(", ")} : normalement toujours allumé.`}</p>
			) : null}
		</>
	);
}

export function Dashboard({ consoleVersion, onLogout }: Props) {
	const services = usePolling<ServiceItem[]>("/services", 5000);
	const [pendingTarget, setPendingTarget] = useState<string | null>(null);
	const [confirmation, setConfirmation] = useState<PendingConfirmation | null>(
		null,
	);
	const [logsService, setLogsService] = useState<ServiceItem | null>(null);
	const [toasts, setToasts] = useState<ToastItem[]>([]);
	// crypto.randomUUID n'existe qu'en HTTPS : la console est en HTTP sur le LAN
	const toastCounter = useRef(0);

	const dismissToast = useCallback((id: string) => {
		setToasts((current) => current.filter((toast) => toast.id !== id));
	}, []);

	const pushToast = useCallback(
		(variant: ToastVariantEnum, message: string) => {
			toastCounter.current += 1;
			const id = String(toastCounter.current);
			setToasts((current) => [...current, { id, variant, message }]);
			// Les erreurs restent jusqu'à ce qu'on les ferme
			if (variant !== ToastVariantEnum.ERROR)
				window.setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
		},
		[dismissToast],
	);

	async function execute(path: string, target: string, done: string) {
		setPendingTarget(target);
		try {
			await apiRequest(path, { method: "POST" });
			pushToast(ToastVariantEnum.SUCCESS, done);
		} catch (error) {
			pushToast(
				ToastVariantEnum.ERROR,
				error instanceof Error ? error.message : String(error),
			);
		} finally {
			setPendingTarget(null);
			services.refresh();
		}
	}

	// Sans surprise, l'action part tout de suite. Elle demande confirmation si elle touche
	// un service « toujours allumé », un groupe entier, ou entraîne d'autres services.
	function requestAction(
		action: ServiceActionEnum,
		target: string,
		targetNames: string[],
		path: string,
		displayName: string,
	) {
		const list = services.data ?? [];
		const byName = new Map(list.map((service) => [service.name, service]));
		const steps = planServiceAction(action, targetNames, list);
		if (steps.length === 0) {
			pushToast(ToastVariantEnum.INFO, `${displayName} : rien à faire`);
			return;
		}

		const done = `${displayName} : ${ACTION_LABELS[action].done}`;
		function run(): void {
			void execute(path, target, done);
		}
		const needsConfirmation =
			targetNames.length > 1 ||
			steps.some(
				(step) =>
					!targetNames.includes(step.name) ||
					byName.get(step.name)?.mode === "always",
			);
		if (!needsConfirmation) {
			run();
			return;
		}
		setConfirmation({
			title: `${ACTION_LABELS[action].verb} ${displayName} ?`,
			description: describeSteps(steps, byName),
			destructive: action !== ServiceActionEnum.START,
			run,
		});
	}

	return (
		<div className={styles.dashboard}>
			<header className={styles.topbar}>
				<span className={styles.brand}>
					<span className={styles.logo}>
						<Castle
							size={18}
							strokeWidth={2.25}
						/>
					</span>
					Citadel
					<span className={styles.subtitle}>Console</span>
				</span>
				<span className={styles.version}>{consoleVersion}</span>
				<IconButton
					icon={LogOut}
					label="Se déconnecter"
					size="sm"
					onClick={onLogout}
				/>
			</header>

			<main className={styles.main}>
				<div className={styles.cards}>
					<SystemCard />
					<VpnCard />
					<TorrentCard />
					<SiteCard />
					<DeadlinesCard />
				</div>

				<ThemeProvider theme={SERVICES_THEME}>
					<section
						className={styles.section}
						aria-labelledby="services-title"
					>
						<h2
							id="services-title"
							className={styles.sectionTitle}
						>
							Services
						</h2>
						{services.error ? (
							<p className={styles.error}>{services.error}</p>
						) : null}
						{services.data === null && !services.error ? (
							<p className={styles.muted}>Lecture…</p>
						) : null}
						{groupServices(services.data ?? []).map(([group, items]) => (
							<ServiceGroup
								key={group}
								group={group}
								services={items}
								pendingTarget={pendingTarget}
								now={services.updatedAt}
								onServiceAction={(service, action) =>
									requestAction(
										action,
										service.name,
										[service.name],
										`/services/${service.name}/${action}`,
										service.label,
									)
								}
								onGroupAction={(groupName, action) =>
									requestAction(
										action,
										groupName,
										items
											.filter((service) => service.controllable)
											.map((service) => service.name),
										`/groups/${groupName}/${action}`,
										`le groupe ${GROUP_LABELS[groupName] ?? groupName}`,
									)
								}
								onShowLogs={setLogsService}
							/>
						))}
					</section>
				</ThemeProvider>

				<AccessSection />

				{services.data ? (
					<section
						className={styles.section}
						aria-labelledby="versions-title"
					>
						<h2
							id="versions-title"
							className={styles.sectionTitle}
						>
							Versions
						</h2>
						<VersionsTable services={services.data} />
					</section>
				) : null}
			</main>

			<ConfirmDialog
				open={confirmation !== null}
				title={confirmation?.title ?? ""}
				description={confirmation?.description}
				confirmLabel="Confirmer"
				destructive={confirmation?.destructive ?? false}
				onConfirm={() => {
					confirmation?.run();
					setConfirmation(null);
				}}
				onCancel={() => setConfirmation(null)}
			/>
			<LogsDialog
				service={logsService}
				onClose={() => setLogsService(null)}
			/>
			<Toaster
				toasts={toasts}
				onDismiss={dismissToast}
			/>
		</div>
	);
}
