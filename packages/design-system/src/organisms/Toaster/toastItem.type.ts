import type { ToastVariantEnum } from "./toastVariant.enum";

export type ToastItem = {
	id: string;
	variant: ToastVariantEnum;
	message: string;
	action?: {
		label: string;
		onClick: () => void;
	};
};
