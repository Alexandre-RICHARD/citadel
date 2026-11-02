import type { ClientContextBean } from "./clientContextBean.type.ts";

// Le navigateur d'une requête : d'où elle vient, et les jetons de ses cookies (undefined : pas de cookie)
export type BrowserContextBean = {
	client: ClientContextBean;
	sessionToken: string | undefined;
	flowToken: string | undefined;
};
