import { IconButton } from "@citadel/design-system/src/atoms/IconButton";
import { Gauge, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { ServiceItem } from "../../../shared/serviceItem.type";
import type { LimitsInput } from "../../status/limitsInput.type";
import { parseLimitsInput } from "../../status/parseLimitsInput";
import { ActionButton } from "../ActionButton";
import styles from "./limitsDialog.module.scss";

type Props = {
	// Le service dont on change les limites ; null : fermée
	service: ServiceItem | null;
	onApply: (service: ServiceItem, limits: LimitsInput) => void;
	onReset: (service: ServiceItem) => void;
	onClose: () => void;
};

const cpuFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

function memoryMibText(service: ServiceItem): string {
	return service.memoryLimitBytes === null
		? ""
		: String(Math.round(service.memoryLimitBytes / 1024 ** 2));
}

function cpusText(service: ServiceItem): string {
	return service.cpuLimit === null ? "" : cpuFormat.format(service.cpuLimit);
}

// Les limites de mémoire et de processeur d'un conteneur, changées à chaud (docker update,
// par infra-ops) : sans redémarrage, jusqu'à sa prochaine recréation. « Valeurs de
// compose.yml » le recrée avec celles d'origine.
export function LimitsDialog({ service, onApply, onReset, onClose }: Props) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	// Les champs, rattachés au service ouvert : un autre service repart de ses valeurs
	const [fields, setFields] = useState<{
		name: string;
		memory: string;
		cpus: string;
	} | null>(null);
	const current =
		service && fields?.name === service.name
			? fields
			: service
				? {
						name: service.name,
						memory: memoryMibText(service),
						cpus: cpusText(service),
					}
				: null;
	const parsed =
		service && current
			? parseLimitsInput(current.memory, current.cpus, service)
			: "Rien à changer";

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (service && !dialog.open) dialog.showModal();
		if (!service && dialog.open) dialog.close();
	}, [service]);

	return (
		<dialog
			ref={dialogRef}
			className={styles.limitsDialog}
			aria-label={service ? `Limites de ${service.label}` : "Limites"}
			onCancel={(event) => {
				event.preventDefault();
				onClose();
			}}
		>
			<header className={styles.header}>
				<Gauge
					size={16}
					aria-hidden
				/>
				<h2 className={styles.title}>
					{service ? `Limites · ${service.label}` : "Limites"}
				</h2>
				<IconButton
					icon={X}
					label="Fermer"
					size="sm"
					onClick={onClose}
				/>
			</header>
			{service && current ? (
				<div className={styles.body}>
					<p className={styles.warning}>
						{
							"Appliquées à chaud, sans redémarrage. Trop basses, le service ralentit, ou est tué puis relancé faute de mémoire. Elles tiennent jusqu'au prochain déploiement."
						}
					</p>
					<label className={styles.field}>
						Mémoire (Mio)
						<input
							className={styles.input}
							inputMode="numeric"
							placeholder="sans limite"
							value={current.memory}
							onChange={(event) =>
								setFields({ ...current, memory: event.target.value })
							}
						/>
					</label>
					<label className={styles.field}>
						Processeur (cœurs)
						<input
							className={styles.input}
							inputMode="decimal"
							placeholder="sans limite"
							value={current.cpus}
							onChange={(event) =>
								setFields({ ...current, cpus: event.target.value })
							}
						/>
					</label>
					{typeof parsed === "string" && parsed !== "Rien à changer" ? (
						<p className={styles.error}>{parsed}</p>
					) : null}
					<div className={styles.actions}>
						<ActionButton
							label="Valeurs de compose.yml"
							icon={RotateCcw}
							disabled={!service.limitsChanged}
							onClick={() => onReset(service)}
						/>
						<ActionButton
							label="Appliquer"
							icon={Gauge}
							variant="primary"
							disabled={typeof parsed === "string"}
							onClick={() => {
								if (typeof parsed !== "string") onApply(service, parsed);
							}}
						/>
					</div>
					<p className={styles.hint}>
						{service.limitsChanged
							? "Limites modifiées depuis la console. Revenir à celles de compose.yml recrée le conteneur : quelques secondes de coupure."
							: "Ce sont celles de compose.yml."}
					</p>
				</div>
			) : null}
		</dialog>
	);
}
