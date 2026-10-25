import type { ServiceItem } from "../../../shared/serviceItem.type";
import styles from "./versionsTable.module.scss";

type Props = {
	services: ServiceItem[];
};

// Fonctionnalité 10 (§14.3) : la version en service de chaque outil. La dernière version
// publiée s'ajoutera avec le job update-check (étape 29).
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
					</tr>
				</thead>
				<tbody>
					{services.map((service) => (
						<tr key={service.name}>
							<td>{service.label}</td>
							<td className={styles.image}>{service.image.split(":")[0]}</td>
							<td className={styles.version}>{service.version}</td>
						</tr>
					))}
				</tbody>
			</table>
		</section>
	);
}
