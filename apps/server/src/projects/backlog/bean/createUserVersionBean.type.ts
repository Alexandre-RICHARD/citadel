import type { NewUserVersionBean } from "./newUserVersionBean.type.ts";

export type CreateUserVersionBean = {
	gameId: number;
	userVersion: NewUserVersionBean;
};
