import type { ReactNode } from "react";

import type { ServiceItem } from "../../../shared/serviceItem.type";
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

// La version en service de chaque outil, et la dernière publiée de la même forme,
// relevée chaque nuit par update-check (§10.7), avec le lien vers ses notes de version.
// Mettre à jour : changer le tag dans compose.yml, commiter, pnpm release.
export function VersionsTable({ services }: Props) {
	return (
		<section
			className={styles.versionsTable}
			aria-label="Versions"
		>
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
					{services.map((service) => (
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
