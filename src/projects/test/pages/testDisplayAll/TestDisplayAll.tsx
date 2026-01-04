import type { TestDto } from "@specs/project/test/dto/test.dto";
import { useState } from "react";

import { Button } from "../../../../common/components/button/Button";
import { useDeleteTest } from "../../actions/useDeleteTest";
import { useGetAllTest } from "../../actions/useGetAllTest";
import { OneTestDataLine } from "../../components/oneTestDataLine/OneTestDataLine";
import { CreateTest } from "../../components/testDataForm/CreateTest";
import { UpdateTest } from "../../components/testDataForm/UpdateTest";
import { TranslationTest } from "../../components/TranslationTest/TranslationTest";
import styles from "./testDisplayAll.module.scss";

export function TestDisplayAll() {
	const [isEditionModalOpen, setIsEditionModalOpen] = useState<boolean>(false);
	const [selectedTestData, setSelectedTestData] = useState<TestDto | null>(
		null,
	);
	const [pendingTest, setPendingTest] = useState<TestDto>();

	const { data, error, isFetching, refetch } = useGetAllTest();

	function refetchTestData() {
		refetch()
			.then(() => undefined)
			.catch(() => undefined);
	}

	const { mutate } = useDeleteTest({ onSuccess: refetchTestData });

	if (error) return <p>Erreur lors du chargement des données de tests</p>;

	const handleCreateTest = () => {
		setPendingTest(undefined);
		refetchTestData();
	};

	const handleCloseModal = () => {
		setIsEditionModalOpen(false);
	};

	const handleDeleteTest = (id: number) => {
		mutate({ id: id.toString() });
	};

	return (
		<div className={styles.testDisplayContainer}>
			{isFetching ? <p>En cours de chargement</p> : null}
			<table className={styles.testTable}>
				<thead>
					<tr>
						<td>Id</td>
						<td>Nom</td>
						<td>Actif</td>
						<td>Créé le</td>
						<td>Éditer</td>
						<td>Supprimer</td>
					</tr>
				</thead>
				<tbody>
					{data?.data.map((test) => (
						<OneTestDataLine
							key={test.id}
							test={test}
							setSelectedTestData={(newSelectedTestData: TestDto) => {
								setIsEditionModalOpen(true);
								setSelectedTestData(newSelectedTestData);
							}}
							onDelete={() => handleDeleteTest(test.id)}
						/>
					))}
					{pendingTest ? (
						<OneTestDataLine
							pending
							test={pendingTest}
						/>
					) : null}
				</tbody>
			</table>
			<Button
				label="Créer une nouvelle entrée"
				onClick={() => {
					setIsEditionModalOpen(true);
					setSelectedTestData(null);
				}}
			/>
			{isEditionModalOpen && !selectedTestData ? (
				<CreateTest
					onClose={handleCloseModal}
					onCreateSubmit={setPendingTest}
					onCreateSuccess={handleCreateTest}
				/>
			) : null}
			{isEditionModalOpen && selectedTestData !== null ? (
				<UpdateTest
					selectedTestData={selectedTestData}
					onClose={handleCloseModal}
					onUpdateSuccess={handleCreateTest}
				/>
			) : null}
			<TranslationTest />
		</div>
	);
}
