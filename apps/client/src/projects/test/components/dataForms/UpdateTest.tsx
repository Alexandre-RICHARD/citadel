import { CheckboxInput } from "@citadel/design-system/src/atoms/CheckboxInput";
import { TextInput } from "@citadel/design-system/src/atoms/TextInput";
import type { TestDto } from "@citadel/specs/src/projects/test/dto/testDto";
import { useState } from "react";

import { useUpdateTest } from "../../actions/useUpdateTest";
import { TestDataForm } from "./TestDataForm";

type Props = {
	selectedTestData: TestDto;
	onClose: () => void;
	onUpdateSuccess: () => void;
};

export function UpdateTest({
	selectedTestData,
	onClose,
	onUpdateSuccess,
}: Props) {
	const [name, setName] = useState<string>(selectedTestData.name);
	const [isActive, setIsActive] = useState<boolean>(selectedTestData.isActive);

	const { mutate } = useUpdateTest({
		onSettled: onUpdateSuccess,
	});

	const handleMutation = () => {
		onClose();
		mutate({ id: selectedTestData.id.toString(), name, isActive });
	};

	return (
		<TestDataForm
			onClose={onClose}
			handleMutation={handleMutation}
		>
			<div>
				<TextInput
					id="testNameUpdate"
					label="Nom de la donnée"
					value={name}
					onChange={setName}
				/>
				<CheckboxInput
					id="testIsActiveUpdate"
					label="État de l utilisateur"
					value={isActive}
					onChange={setIsActive}
				/>
			</div>
		</TestDataForm>
	);
}
