import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";
import {
	BadgeCheck,
	Ban,
	CircleDashed,
	Crown,
	Eye,
	Flag,
	Gauge,
	type LucideIcon,
	Play,
	Trophy,
} from "lucide-react";

import styles from "../../backlog.module.scss";

type StatusDescription = {
	label: string;
	// Le libellé pour un type de fin sans fin imposée (Runs, Bac à sable, Multijoueur), s'il diffère
	estimatedLabel?: string;
	meaning: string;
	icon: LucideIcon;
	// Teinte du badge : gris et marron au repos, bleu-violet pour joué pas fini, du jaune au rouge pour fini
	tone: string | undefined;
};

// Tout ce qu'on sait d'un statut, au même endroit : libellés, signification, icône et teinte. Les familles (au repos,
// joué pas fini, fini) se lisent dans l'ordre de l'énumération, qui est celui de l'échelle
export const statusDescriptions: Readonly<
	Record<StatusEnum, StatusDescription>
> = {
	[StatusEnum.NOT_STARTED]: {
		label: "Pas commencé",
		meaning: "Dans le backlog, jamais lancé",
		icon: CircleDashed,
		tone: styles.toneGray,
	},
	[StatusEnum.ABANDONED]: {
		label: "Abandonné",
		meaning: "Arrêté sans intention d'y revenir",
		icon: Ban,
		tone: styles.toneBrown,
	},
	[StatusEnum.STARTED]: {
		label: "À peine joué",
		meaning: "Lancé, quelques heures de jeu",
		icon: Play,
		tone: styles.toneIris,
	},
	[StatusEnum.WELL_UNDERWAY]: {
		label: "Bien entamé",
		meaning: "Bonne progression, pas encore fini",
		icon: Gauge,
		tone: styles.toneIndigo,
	},
	[StatusEnum.WATCHED]: {
		label: "Vu sans jouer",
		meaning: "Je l'ai fait avec des amis",
		icon: Eye,
		tone: styles.toneYellow,
	},
	[StatusEnum.FINISHED]: {
		label: "Fini",
		estimatedLabel: "Estimé fini",
		meaning:
			"Fin principale atteinte. Estimé fini : pas de fin officielle, mais je le considère fini",
		icon: Flag,
		tone: styles.toneGold,
	},
	[StatusEnum.COMPLETED]: {
		label: "Complété (100 %)",
		estimatedLabel: "Estimé complété (100 %)",
		meaning:
			"Fini, et tout le contenu fait : quêtes annexes, collectibles, fins secondaires",
		icon: BadgeCheck,
		tone: styles.toneOrange,
	},
	[StatusEnum.PLATINUM]: {
		label: "Platiné",
		meaning: "Fini, et tous les succès ou trophées de la plateforme obtenus",
		icon: Trophy,
		tone: styles.toneVermilion,
	},
	[StatusEnum.COMPLETED_AND_PLATINUM]: {
		label: "Complété et platiné",
		meaning: "Les deux à la fois",
		icon: Crown,
		tone: styles.toneCrimson,
	},
};
