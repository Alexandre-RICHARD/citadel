import type { ClientContextBean } from "./clientContextBean.type.ts";

export type CreateSessionBean = {
	userId: number;
	remember: boolean;
	client: ClientContextBean;
};
