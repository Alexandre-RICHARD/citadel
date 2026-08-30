import styles from "./button.module.scss";

type Props = {
	label: string;
	onClick: () => void;
	fullWidth?: boolean;
};

export function Button({ label, onClick, fullWidth }: Props) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`${styles.button} ${fullWidth ? styles.fullWidth : undefined}`}
		>
			{label}
		</button>
	);
}
