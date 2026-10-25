import type { AccessEntry } from "../../../shared/accessEntry.type";
import { formatAgo } from "../../format/formatAgo";
import styles from "./requestsTable.module.scss";

type Props = {
	requests: AccessEntry[];
	now: number;
};

function statusTone(status: number): string {
	if (status >= 500) return "danger";
	if (status >= 400) return "warn";
	return "ok";
}

// Les dernières pages et appels d'API du site, sans les fichiers qu'ils chargent
export function RequestsTable({ requests, now }: Props) {
	if (requests.length === 0)
		return <p className={styles.muted}>Aucune requête sur 24 h.</p>;

	return (
		<section
			className={styles.requestsTable}
			aria-label="Dernières requêtes"
		>
			<table>
				<thead>
					<tr>
						<th scope="col">Quand</th>
						<th scope="col">IP</th>
						<th scope="col">Requête</th>
						<th scope="col">Code</th>
					</tr>
				</thead>
				<tbody>
					{requests.map((request) => (
						<tr key={`${request.at}${request.ip}${request.path}`}>
							<td className={styles.when}>{formatAgo(request.at, now)}</td>
							<td className={styles.ip}>
								{request.ip}
								{request.country ? (
									<span className={styles.country}>{request.country}</span>
								) : null}
							</td>
							<td className={styles.request}>
								<span className={styles.method}>{request.method}</span>
								{request.path}
							</td>
							<td
								className={styles.status}
								data-tone={statusTone(request.status)}
							>
								{request.status}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</section>
	);
}
