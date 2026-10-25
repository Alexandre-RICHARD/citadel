import { CheckboxInput } from "@citadel/design-system/src/atoms/CheckboxInput";
import { TextInput } from "@citadel/design-system/src/atoms/TextInput";
import { useState } from "react";

import type { TestFm } from "../../api/testFm.type";
import { useUpdateTest } from "../../api/useUpdateTest";
import { TestDataForm } from "./TestDataForm";

type Props = {
	selectedTestData: TestFm;
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

	function handleMutation() {
		onClose();
		mutate({ id: selectedTestData.id.toString(), name, isActive });
	}

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
