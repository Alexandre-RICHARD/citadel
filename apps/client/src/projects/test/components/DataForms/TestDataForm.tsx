import { Modal } from "@citadel/design-system/src/molecules/Modal";
import type { ReactNode } from "react";

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
