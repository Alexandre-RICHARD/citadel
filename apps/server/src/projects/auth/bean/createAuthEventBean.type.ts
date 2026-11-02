import type { AuthEventTypeEnum } from "../enum/authEventType.enum.ts";
import type { ClientContextBean } from "./clientContextBean.type.ts";

export type CreateAuthEventBean = {
	type: AuthEventTypeEnum;
	// null : aucun compte trouvé (identifiant inconnu, inscription)
	userId: number | null;
	client: ClientContextBean;
};
