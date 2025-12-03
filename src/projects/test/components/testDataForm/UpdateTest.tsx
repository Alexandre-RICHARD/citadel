import type { TestDto } from "@specs/project/test/dto/test.dto";
import { useState } from "react";

import { InputCheckbox } from "../../../../common/components/inputCheckbox/InputCheckbox";
import { InputText } from "../../../../common/components/inputText/InputText";
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
				<InputText
					id="testNameUpdate"
					label="Nom de la donnée"
					value={name}
					onChange={setName}
				/>
				<InputCheckbox
					id="testIsActiveUpdate"
					label="État de l utilisateur"
					value={isActive}
					onChange={setIsActive}
				/>
			</div>
		</TestDataForm>
	);
}
