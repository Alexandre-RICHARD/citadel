import { TextInput } from "@citadel/design-system/src/atoms/TextInput";
import type { TestDto } from "@citadel/specs/src/projects/test/dto/testDto.type";
import { useState } from "react";

import { useCreateTest } from "../../actions/useCreateTest";
import { TestDataForm } from "./TestDataForm";

type Props = {
	onClose: () => void;
	onCreateSubmit: (pendingTest: TestDto) => void;
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
