import type { TestDto } from "@specs/projects/test/dto/test.dto";
import { useState } from "react";

import { TextInput } from "../../../../common/components/components/inputs/TextInput/index.tsx";
import { useCreateTest } from "../../actions/useCreateTest.tsx";
import { TestDataForm } from "./TestDataForm.tsx";

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

	const handleMutation = () => {
		onClose();
		mutate({ name });
		onCreateSubmit({
			id: 0,
			name,
			isActive: true,
			createdAt: new Date(),
			updatedAt: null,
		});
	};

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
