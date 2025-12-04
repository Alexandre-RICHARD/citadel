import { useEffect } from "react";
import { NavLink, useNavigate, useParams } from "react-router";

import { LanguageEnum } from "../../../../common/enum/language.enum";
import { formatDate } from "../../../../common/helpers/date/formatDate";
import { useGetOneTest } from "../../actions/useGetOneTest";
import styles from "./testDisplayOne.module.scss";

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
					<p>
						<span className={styles.dataType}>Id :</span> {data?.data.id}
					</p>
					<p>
						<span className={styles.dataType}>Nom :</span> {data?.data.name}
					</p>
					<p>
						<span className={styles.dataType}>Actif :</span>{" "}
						{data?.data.isActive}
					</p>
					<p>
						<span className={styles.dataType}>Créé le :</span>{" "}
						{formatDate(data?.data.createdAt, LanguageEnum.FRENCH)}
					</p>
				</>
			) : null}
		</div>
	);
}
