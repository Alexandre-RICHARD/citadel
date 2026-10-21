import styles from "./backlog.module.scss";

type UserData = {
	gameId: number;
	plateforme: string;
	endingType: string;
	own: boolean;
	ignore: boolean;
}[];

type StoredGame = {
	id: number;
	franchiseId?: number;
	positionInFranchise?: number;
	nameVO: string;
	namVF?: string;
}[];

type GameData = {
	gameSerie: string; // ✅ Si la série existe, si le jeu appartient à une série
	serieNumber: number; // ✅ Si la série existe, si le jeu appartient à une série
	gameName: string; // ✅ Si Vo sans VF ou si jeu nommé en FR, juste afficher le nom, si les 2 "<VO> (<VF>)"
	gameNameVF: string; // ✅ Si Vo sans VF ou si jeu nommé en FR, juste afficher le nom, si les 2 "<VO> (<VF>)"
	releaseDate: Date; // Date de sortie du titre original, sur son premier support. Non sorti si dans le futur
	supportPlayed: string; // Si dans le backlog du joueur, ce jeu n'a été que dans une seule édition, sur une seule plateforme, alors on l'affiche, sinon, ça ne sera que sur les lignes "ouvrables
	endingType: string; // A choisir entre "Histoire" / "Bac à sable subjectif" / "Multijoueur subjectif" / "Retry"
	own: boolean; // Si je peux lancer le jeu quand je veux
	ignore: boolean; // Si je ne compte pas, n'ai pas envie de relancer le jeu prochainement dans ma vie OU totalement l'inverse en mode "dans mes envies de jouer"
	status: string; // Le meilleur statut que je peux lui attribué entre "Jamais joué" / "A peine commencé" / "Arrêté" / "En cours" / "Beaucoup joué" / "Fini" / "Fini 100%" / "Fini 100% + succès" / "Fini succès"
	realTimePlayed: number;
	estimatedTimePlayed: number;
	igdbUrl: string; // Pour accéder à la page IGDB
};

export function Backlog() {
	return (
		<div className={styles.backlogContainer}>
			<table className={styles.backlogTable}>
				<thead>
					<tr>
						<th>Série de jeu</th>
						<th>Numéro dans la série</th>
						<th>Nom du jeu</th>
						<th>Date de sortie</th>
						<th>Plateforme jouées</th>
						<th>Type de fin</th>
						<th>Possédé</th>
						<th>Ignoré</th>
						<th>Status global</th>
						<th>Temps réel</th>
						<th>Temps estimé</th>
						<th>Url</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Grand Theft Auto</td>
						<td>5</td>
						<td>Grand Theft Auto V</td>
						<td>17.09.13</td>
						<td>PS3</td>
						<td>Histoire</td>
						<td>[X]</td>
						<td>[X]</td>
						<td>Fini 100%</td>
						<td>1417h 26m</td>
						<td>125h</td>
						<td>
							<a
								href="https://www.igdb.com/games/grand-theft-auto-v"
								target="_blank"
								rel="noreferrer"
							>
								IGDB
							</a>
						</td>
					</tr>
				</tbody>
				<tfoot>
					<tr>
						<th>Série de jeu</th>
						<th>Numéro dans la série</th>
						<th>Nom du jeu</th>
						<th>Date de sortie</th>
						<th>Plateforme jouées</th>
						<th>Type de fin</th>
						<th>Possédé</th>
						<th>Ignoré</th>
						<th>Status global</th>
						<th>Temps réel</th>
						<th>Temps estimé</th>
						<th>Url</th>
					</tr>
				</tfoot>
			</table>
		</div>
	);
}
