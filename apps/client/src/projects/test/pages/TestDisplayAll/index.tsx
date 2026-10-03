import { Button } from "@citadel/design-system/src/atoms/Button";
import { useState } from "react";

import type { TestFm } from "../../api/testFm.type";
import { useDeleteTest } from "../../api/useDeleteTest";
import { useGetAllTest } from "../../api/useGetAllTest";
import { CreateTest } from "../../components/DataForms/CreateTest";
import { UpdateTest } from "../../components/DataForms/UpdateTest";
import { OneTestDataLine } from "../../components/OneTestDataLine";
import { TranslationTest } from "../../components/TranslationTest";
import styles from "./testDisplayAll.module.scss";

export function TestDisplayAll() {
	const [isEditionModalOpen, setIsEditionModalOpen] = useState<boolean>(false);
	const [selectedTestData, setSelectedTestData] = useState<TestFm | null>(null);
	const [pendingTest, setPendingTest] = useState<TestFm>();

	const { data, error, isFetching, refetch } = useGetAllTest();

	function refetchTestData() {
		refetch()
			.then(() => undefined)
			.catch(() => undefined);
	}

	const { mutate } = useDeleteTest({ onSuccess: refetchTestData });

	if (error) return <p>Erreur lors du chargement des données de tests</p>;

	function handleCreateTest() {
		setPendingTest(undefined);
		refetchTestData();
	}

	function handleCloseModal() {
		setIsEditionModalOpen(false);
	}

	function handleDeleteTest(id: number) {
		mutate({ id: id.toString() });
	}

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
					{data?.map((test) => (
						<OneTestDataLine
							key={test.id}
							test={test}
							setSelectedTestData={(newSelectedTestData: TestFm) => {
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
