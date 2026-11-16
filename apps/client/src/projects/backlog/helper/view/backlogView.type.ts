import type { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import type { TableView } from "@citadel/specs/src/projects/backlog/helper/view/tableView.type";

// Tri, filtres (et leur combinaison) du tableau, celui des jeux par défaut : dans l'URL de la page, et envoyés tels quels au serveur
export type BacklogView<Column extends string = BacklogColumnEnum> =
	TableView<Column>;
