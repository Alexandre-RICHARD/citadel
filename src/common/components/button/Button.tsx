type Props = {
	label: string;
	onClick: () => void;
};

export function Button({ label, onClick }: Props) {
	return (
		<button
			type="button"
			onClick={onClick}
		>
			{label}
		</button>
	);
}
