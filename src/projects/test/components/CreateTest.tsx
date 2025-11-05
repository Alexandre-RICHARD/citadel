import type { TestDto } from "@specs/project/test/dto/test.dto";
import { useState } from "react";

import { InputText } from "../../../common/components/inputText/InputText";
import { useCreateTest } from "../actions/useCreateTest";
import { TestForm } from "./TestForm";

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
		<TestForm
			onClose={onClose}
			handleMutation={handleMutation}
		>
			<div>
				<InputText
					value={name}
					onChange={setName}
				/>
			</div>
		</TestForm>
	);
}
