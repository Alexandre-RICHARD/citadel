import { Check, Copy } from "lucide-react";
import { type ReactNode, useState } from "react";

import { isOwnImage } from "../../../shared/isOwnImage";
import type { ServiceItem } from "../../../shared/serviceItem.type";
import { copyToClipboard } from "../../api/copyToClipboard";
import { describeAvailableUpdates } from "../../format/describeAvailableUpdates";
import { ActionButton } from "../ActionButton";
import styles from "./versionsTable.module.scss";

type Props = {
	services: ServiceItem[];
};

function latestCell(service: ServiceItem): ReactNode {
	if (service.latestVersion === null) return "–";
	if (service.latestVersion === service.version)
		return <span className={styles.upToDate}>à jour</span>;
	return service.releaseNotesUrl ? (
		<a
			className={styles.newer}
			href={service.releaseNotesUrl}
			target="_blank"
			rel="noreferrer"
			title="Notes de version"
		>
			{service.latestVersion}
		</a>
	) : (
		<span className={styles.newer}>{service.latestVersion}</span>
	);
}

// La version en service de chaque outil tiers, et la dernière publiée de la même forme,
// relevée chaque nuit par update-check, avec le lien vers ses notes de version.
// Mettre à jour : changer le tag dans compose.yml, commiter, pnpm release. Nos images
// n'y sont pas : elles suivent les versions de Citadel, celles de la carte de déploiement.
export function VersionsTable({ services }: Props) {
	const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
		"idle",
	);
	const updatesText = describeAvailableUpdates(services);

	// Les mises à jour disponibles, en texte, pour les coller dans une conversation
	function copyUpdates() {
		function showResult(result: "copied" | "failed") {
			setCopyState(result);
			window.setTimeout(() => setCopyState("idle"), 2500);
		}
		copyToClipboard(updatesText)
			.then(() => showResult("copied"))
			.catch(() => showResult("failed"));
	}

	let copyLabel = "Copier les mises à jour";
	if (copyState === "copied") copyLabel = "Copié";
	if (copyState === "failed") copyLabel = "Copie impossible";

	return (
		<section
			className={styles.versionsTable}
			aria-label="Versions"
		>
			<div className={styles.toolbar}>
				<ActionButton
					label={copyLabel}
					icon={copyState === "copied" ? Check : Copy}
					disabled={updatesText === ""}
					onClick={copyUpdates}
				/>
			</div>
			<table>
				<thead>
					<tr>
						<th scope="col">Service</th>
						<th scope="col">Image</th>
						<th scope="col">En service</th>
						<th scope="col">Publiée</th>
					</tr>
				</thead>
				<tbody>
					{services
						.filter((service) => !isOwnImage(service.image))
						.map((service) => (
							<tr key={service.name}>
								<td>{service.label}</td>
								<td className={styles.image}>{service.image.split(":")[0]}</td>
								<td className={styles.version}>{service.version}</td>
								<td className={styles.version}>{latestCell(service)}</td>
							</tr>
						))}
				</tbody>
			</table>
		</section>
	);
}
