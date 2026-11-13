import { RequiredMark } from "@citadel/design-system/src/atoms/RequiredMark";
import { UserDataProjectEnum } from "@citadel/specs/src/projects/auth/enum/userDataProject.enum";
import { Eraser } from "lucide-react";
import { useId, useState } from "react";

import { ProjectsEnum } from "../../../../../../react/appNavigation/projects.enum";
import { projects } from "../../../../../../react/appNavigation/projectsDictionary";
import { useDeleteProjectData } from "../../../../api/me/useDeleteProjectData";
import { FormAlert } from "../../../../components/FormAlert";
import { PasswordConfirmForm } from "../../../../components/PasswordConfirmForm";
import styles from "./projectDataDeletion.module.scss";

// Les projets qui gardent des données du compte, sous le nom qu'ils portent sur le site
const PROJECT_OPTIONS: { value: UserDataProjectEnum; name: string }[] = [
	{
		value: UserDataProjectEnum.GAME_DEATH_COUNTER,
		name: projects[ProjectsEnum.GameDeathCount].name,
	},
	{
		value: UserDataProjectEnum.BACKLOG,
		name: projects[ProjectsEnum.Backlog].name,
	},
];

const NAME_LIST_FORMAT = new Intl.ListFormat("fr-FR", { type: "conjunction" });

function describeProjects(selected: readonly UserDataProjectEnum[]): string {
	return NAME_LIST_FORMAT.format(
		PROJECT_OPTIONS.filter(({ value }) => selected.includes(value)).map(
			({ name }) => name,
		),
	);
}

// Vider un ou plusieurs projets, mot de passe redemandé : immédiat et définitif, le compte et les autres projets restent
export function ProjectDataDeletion() {
	const fieldId = useId();
	const deleteProjectData = useDeleteProjectData();
	const [isOpen, setIsOpen] = useState(false);
	const [selected, setSelected] = useState<UserDataProjectEnum[]>([]);
	const [deletedProjects, setDeletedProjects] = useState<string | null>(null);

	function toggle(project: UserDataProjectEnum, isChecked: boolean): void {
		setSelected((current) =>
			isChecked
				? [...current, project]
				: current.filter((value) => value !== project),
		);
	}

	function close(): void {
		setIsOpen(false);
		setSelected([]);
	}

	return (
		<div className={styles.block}>
			<h3 className={styles.title}>Supprimer les données d’un projet</h3>
			<p className={styles.hint}>
				Votre compte reste ouvert : seules les données des projets choisis
				disparaissent.
			</p>
			{deletedProjects !== null && (
				<FormAlert tone="info">
					Les données de {deletedProjects} sont supprimées.
				</FormAlert>
			)}
			{isOpen ? (
				<>
					<fieldset className={styles.options}>
						<legend className={styles.legend}>
							Projets à vider
							<RequiredMark />
						</legend>
						{PROJECT_OPTIONS.map(({ value, name }) => (
							<div
								key={value}
								className={styles.option}
							>
								<input
									id={`${fieldId}-${value}`}
									type="checkbox"
									checked={selected.includes(value)}
									onChange={(event) => toggle(value, event.target.checked)}
								/>
								<label htmlFor={`${fieldId}-${value}`}>{name}</label>
							</div>
						))}
					</fieldset>
					<FormAlert tone="error">
						La suppression est immédiate et définitive. Aucun délai de
						récupération : tout ce que vous avez enregistré dans ces projets
						disparaît.
					</FormAlert>
					<PasswordConfirmForm
						actionLabel="supprimer ces données"
						confirmLabel="Supprimer définitivement ces données"
						pendingLabel="Suppression…"
						icon={<Eraser aria-hidden />}
						isDanger
						isPending={deleteProjectData.isPending}
						isDisabled={selected.length === 0}
						onConfirm={(password, options) =>
							deleteProjectData.mutate(
								{ projects: selected, password },
								options,
							)
						}
						onDone={() => {
							setDeletedProjects(describeProjects(selected));
							close();
						}}
						onCancel={close}
					/>
				</>
			) : (
				<button
					type="button"
					className={styles.open}
					onClick={() => {
						setDeletedProjects(null);
						setIsOpen(true);
					}}
				>
					<Eraser aria-hidden />
					Choisir les projets à vider
				</button>
			)}
		</div>
	);
}
