import type { MediaCustomizationBean } from "./mediaCustomizationBean.type.ts";

export type CustomizeUserMediaBean = {
	userMediaId: number;
	customization: MediaCustomizationBean;
};
