import type { ReactNode } from "react";

import { Modal } from "../../../../components/molecules/Modal";

type Props = {
	children: ReactNode;
	onClose: () => void;
	handleMutation: () => void;
};

export function TestDataForm({ children, onClose, handleMutation }: Props) {
	return (
		<Modal
			onClose={onClose}
			onSubmit={handleMutation}
		>
			{children}
		</Modal>
	);
}
