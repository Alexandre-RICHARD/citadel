import { useEffect } from "react";
import { NavLink, useNavigate, useParams } from "react-router";

import { LanguageEnum } from "../../../common/enum/language.enum";
import { formatDate } from "../../../common/helpers/date/formatDate";
import { useGetOneTest } from "../actions/useGetOneTest";

export function TestDisplayOne() {
	const navigate = useNavigate();
	const { id } = useParams();

	useEffect(() => {
		if (id === null) {
			void navigate("..", { replace: true });
		}
	});

	const { data, error, isFetching } = useGetOneTest({
		payload: { id: id ?? null },
	});

	return (
		<div>
			<NavLink to="..">Retourner en arrière</NavLink>
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
