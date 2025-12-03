import type { TestDto } from "@specs/project/test/dto/test.dto";
import { useState } from "react";

import { InputText } from "../../../../common/components/inputText/InputText";
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
				<InputText
					id="testNameCreate"
					label="Nom de la nouvelle donnée"
					value={name}
					onChange={setName}
				/>
			</div>
		</TestDataForm>
	);
}
