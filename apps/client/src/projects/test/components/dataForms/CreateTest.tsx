import { TextInput } from "@citadel/design-system/src/atoms/TextInput";
import { useState } from "react";

import type { TestFm } from "../../api/testFm.type";
import { useCreateTest } from "../../api/useCreateTest";
import { TestDataForm } from "./TestDataForm";

type Props = {
	onClose: () => void;
	onCreateSubmit: (pendingTest: TestFm) => void;
	onCreateSuccess: () => void;
};

export function CreateTest({
	onClose,
	onCreateSubmit,
	onCreateSuccess,
}: Props) {
	const [name, setName] = useState<string>("");

	const { mutate } = useCreateTest({
		onSettled: onCreateSuccess,
	});

	function handleMutation() {
		onClose();
		mutate({ name });
		onCreateSubmit({
			id: 0,
			name,
			isActive: true,
			createdAt: new Date(),
			updatedAt: null,
		});
	}

	return (
		<TestDataForm
			onClose={onClose}
			handleMutation={handleMutation}
		>
			<div>
				<TextInput
					id="testNameCreate"
					label="Nom de la nouvelle donnée"
					value={name}
					onChange={setName}
				/>
			</div>
		</TestDataForm>
	);
}
