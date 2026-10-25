import { ServiceActionEnum } from "../../shared/serviceAction.enum";

export const ACTION_LABELS: Record<
	ServiceActionEnum,
	{ verb: string; done: string }
> = {
	[ServiceActionEnum.START]: { verb: "Démarrer", done: "démarré" },
	[ServiceActionEnum.STOP]: { verb: "Arrêter", done: "arrêté" },
	[ServiceActionEnum.RESTART]: { verb: "Redémarrer", done: "redémarré" },
};
