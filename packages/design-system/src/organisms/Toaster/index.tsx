import { Icon } from "../../atoms/Icon";
import { IconTokenEnum } from "../../atoms/Icon/iconToken.enum";
import styles from "./toaster.module.scss";
import type { ToastItem } from "./toastItem.type";
import { ToastVariantEnum } from "./toastVariant.enum";

type Props = {
	toasts: readonly ToastItem[];
	onDismiss: (id: string) => void;
	regionLabel?: string;
	closeLabel?: string;
};

export function Toaster({
	toasts,
	onDismiss,
	regionLabel = "Notifications",
	closeLabel = "Fermer la notification",
}: Props) {
	return (
		<section
			className={styles.toaster}
			aria-label={regionLabel}
		>
			{toasts.map((toast) => (
				<div
					key={toast.id}
					className={styles.toast}
					data-variant={toast.variant}
					role={toast.variant === ToastVariantEnum.ERROR ? "alert" : "status"}
				>
					<p className={styles.message}>{toast.message}</p>
					{toast.action ? (
						<button
							type="button"
							className={styles.action}
							onClick={toast.action.onClick}
						>
							{toast.action.label}
						</button>
					) : null}
					<button
						type="button"
						className={styles.close}
						aria-label={closeLabel}
						title={closeLabel}
						onClick={() => onDismiss(toast.id)}
					>
						<Icon
							iconToken={IconTokenEnum.Close}
							size={10}
							color="currentColor"
						/>
					</button>
				</div>
			))}
		</section>
	);
}
