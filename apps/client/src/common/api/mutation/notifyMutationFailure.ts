import { ToastVariantEnum } from "@citadel/design-system/src/organisms/Toaster/toastVariant.enum";

import { toastStore } from "../../toast/toastStore";
import type { MutationFailure } from "./mutationFailure.type";

export function notifyMutationFailure({
	message,
	retry,
}: MutationFailure): void {
	toastStore.push({
		variant: ToastVariantEnum.ERROR,
		message,
		...(retry && { action: { label: "Réessayer", onClick: retry } }),
	});
}
