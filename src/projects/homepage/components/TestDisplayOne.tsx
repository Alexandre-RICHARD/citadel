import { NavLink } from "react-router";

import { LanguageEnum } from "../../../common/enum/language.enum";
import { formatDate } from "../../../common/helpers/date/formatDate";
import { useGetProjectInternNewPath } from "../../../common/hooks/navigation/useGetProjectInternNewPath";
import { useGetProjectSubPath } from "../../../common/hooks/navigation/useGetProjectSubPath";
import { useGetOneTest } from "../actions/useGetOneTest";

export function TestDisplayOne() {
	const getProjectInternNewPath = useGetProjectInternNewPath();
	const subPath = useGetProjectSubPath();
	const { data, error, isFetching } = useGetOneTest({
		payload: { id: subPath },
	});

	if (error) return <p>Erreur lors du chargement de cette données de test</p>;

	return (
		<div>
			<NavLink to={getProjectInternNewPath()}>Retourner en arrière</NavLink>
			{error ? (
				<p>Une erreur est survenue dans la récupération de la donnée de test</p>
			) : null}
			{isFetching ? (
				<>
					<p>Id : *récupération*</p>
					<p>Nom : *récupération*</p>
					<p>Actif : *récupération*</p>
					<p>Créé le :*récupération*</p>
				</>
			) : null}
			{data ? (
				<>
					<p>Id : {data?.data.id}</p>
					<p>Nom : {data?.data.name}</p>
					<p>Actif : {data?.data.isActive}</p>
					<p>
						Créé le : {formatDate(data?.data.createdAt, LanguageEnum.FRENCH)}
					</p>
				</>
			) : null}
		</div>
	);
}
