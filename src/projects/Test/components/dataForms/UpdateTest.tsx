import type { TestDto } from "@specs/projects/test/dto/test.dto";
import { useState } from "react";

import { CheckboxInput } from "../../../../common/components/components/inputs/CheckboxInput/index.tsx";
import { TextInput } from "../../../../common/components/components/inputs/TextInput/index.tsx";
import { useUpdateTest } from "../../actions/useUpdateTest.tsx";
import { TestDataForm } from "./TestDataForm.tsx";

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
