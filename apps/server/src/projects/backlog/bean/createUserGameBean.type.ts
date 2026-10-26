import type { CustomizationInputBean } from "./customizationInputBean.type.ts";
import type { NewUserVersionBean } from "./newUserVersionBean.type.ts";

export type CreateUserGameBean = {
	gameId: number;
	customization: CustomizationInputBean;
	userVersion: NewUserVersionBean;
};
