import type { ClientContextBean } from "./clientContextBean.type.ts";

export type CreateSessionBean = {
	userId: number;
	remember: boolean;
	client: ClientContextBean;
	// La session que ce navigateur avait déjà : une nouvelle connexion la remplace
	replacedToken?: string | undefined;
};
