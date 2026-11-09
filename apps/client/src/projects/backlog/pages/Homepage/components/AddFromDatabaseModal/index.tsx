import { navigateResults } from "@citadel/common/src/browser/keyboard/navigateResults";
import { useActiveIndex } from "@citadel/common/src/react/hooks/useActiveIndex";
import { useDebouncedValue } from "@citadel/common/src/react/hooks/useDebouncedValue";
import { useScrollIntoView } from "@citadel/common/src/react/hooks/useScrollIntoView";
import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import { LibraryBig, Search, SearchX, Trash2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { useDeleteStoredGame } from "../../../../api/game/useDeleteStoredGame";
import { useStoredGames } from "../../../../api/game/useStoredGames";
import type { GameHitFm } from "../../../../api/model/gameHitFm.type";
import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";
import { Modal } from "../../../../components/Modal";
import { Spinner } from "../../../../components/Spinner";
import { UiDelayEnum } from "../../../../helper/timing/uiDelay.enum";
import { LoadingState } from "../LoadingState";
import { SearchResultOption } from "../SearchResultOption";

type Props = {
	onSelect: (hit: GameHitFm) => void;
	onClose: () => void;
};

/**
 * « Ajouter un jeu depuis la Citadel » : les jeux en base hors backlog, triés par nom, filtrés sans requête IGDB. Chacun peut aussi quitter la base, si aucun backlog ne l'a
 * 50 jeux, puis la page suivante à l'approche du bas de la liste ; comme la recherche, elle se parcourt au clavier
 */
export function AddFromDatabaseModal({ onSelect, onClose }: Props) {
	const [query, setQuery] = useState("");
	const debouncedQuery = useDebouncedValue(query, UiDelayEnum.TYPING_DEBOUNCE);
	const { games, totalCount, isLoading, error, hasNextPage, fetchNextPage } =
		useStoredGames(debouncedQuery);
	// Le jeu dont la suppression de la base attend sa confirmation
	const [gameToDelete, setGameToDelete] = useState<GameHitFm | null>(null);
	const deleteStoredGame = useDeleteStoredGame(gameToDelete?.id ?? 0);
	const listRef = useRef<HTMLUListElement>(null);
	const loadMoreRef = useRef<HTMLLIElement>(null);
	const filterRef = useRef<HTMLInputElement>(null);
	const listId = useId();
	const [activeIndex, setActiveIndex] = useActiveIndex(debouncedQuery);
	const activeResultId =
		activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined;
	useScrollIntoView(activeResultId);

	// Défilement infini dans la liste, qui défile seule sous le filtre
	useEffect(() => {
		const list = listRef.current;
		const loadMore = loadMoreRef.current;
		if (!hasNextPage || list === null || loadMore === null) return undefined;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some(({ isIntersecting }) => isIntersecting))
					fetchNextPage();
			},
			{ root: list, rootMargin: "0px 0px 400px 0px" },
		);
		observer.observe(loadMore);
		return () => observer.disconnect();
	}, [hasNextPage, fetchNextPage, games.length]);

	let content = (
		<ul
			ref={listRef}
			id={listId}
			role="listbox"
			aria-label="Jeux de la Citadel"
			className={joinClassNames(styles.resultList, styles.databaseList)}
			onMouseDown={(event) => event.preventDefault()}
		>
			{games.map((hit, index) => (
				<SearchResultOption
					key={hit.id}
					id={`${listId}-${index}`}
					hit={hit}
					isActive={index === activeIndex}
					badge={
						<Button
							icon={Trash2}
							variant="ghost"
							size="sm"
							ariaLabel={`Supprimer « ${hit.frenchName ?? hit.name} » de la base`}
							tooltip="Supprimer de la base"
							onClick={(event) => {
								event.stopPropagation();
								setGameToDelete(hit);
							}}
						/>
					}
					onHover={() => setActiveIndex(index)}
					onSelect={onSelect}
				/>
			))}
			{hasNextPage && (
				<li
					ref={loadMoreRef}
					role="presentation"
					className={styles.listMessage}
				>
					<Spinner />
					{totalCount - games.length} jeux de plus…
				</li>
			)}
		</ul>
	);
	if (isLoading || error !== null)
		content = (
			<LoadingState
				error={error}
				actionLabel="charger les jeux de la Citadel"
			>
				Chargement des jeux de la Citadel…
			</LoadingState>
		);
	else if (games.length === 0)
		content = (
			<p className={joinClassNames(styles.listMessage, styles.listBox)}>
				<SearchX aria-hidden />
				{debouncedQuery.trim() === ""
					? "Tous les jeux de la base sont dans le backlog"
					: "Aucun résultat"}
			</p>
		);

	// La confirmation prend la place de la liste, qui garde sa saisie : sans annulation possible, la suppression se confirme
	if (gameToDelete !== null)
		return (
			<Modal
				title="Supprimer de la base"
				subtitle={gameToDelete.frenchName ?? gameToDelete.name}
				icon={Trash2}
				size="sm"
				actions={
					<>
						<Button onClick={() => setGameToDelete(null)}>Annuler</Button>
						<Button
							variant="danger"
							icon={Trash2}
							onClick={() => {
								deleteStoredGame.mutate();
								setGameToDelete(null);
							}}
						>
							Supprimer
						</Button>
					</>
				}
				onClose={() => setGameToDelete(null)}
			>
				<p className={styles.modalQuestion}>
					Le jeu quitte la base avec ses versions et ses DLC, pour tous les
					comptes. Impossible si l’un d’eux l’a dans son backlog.
				</p>
			</Modal>
		);

	return (
		<Modal
			title="Ajouter un jeu depuis la Citadel"
			subtitle="Les jeux déjà en base, hors du backlog : sans passer par IGDB"
			icon={LibraryBig}
			initialFocusRef={filterRef}
			actions={<Button onClick={onClose}>Annuler</Button>}
			onClose={onClose}
		>
			<div className={styles.filterBox}>
				<Search
					className={styles.filterBoxIcon}
					aria-hidden
				/>
				<input
					ref={filterRef}
					type="search"
					role="combobox"
					className={styles.filterBoxInput}
					placeholder="Filtrer par nom ou titre de version"
					aria-label="Filtrer les jeux de la Citadel"
					aria-expanded={games.length > 0}
					aria-controls={games.length > 0 ? listId : undefined}
					aria-autocomplete="list"
					aria-activedescendant={activeResultId}
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					onKeyDown={(event) =>
						navigateResults(
							event,
							activeIndex,
							games.length,
							setActiveIndex,
							() => {
								const hit = games.at(activeIndex);
								if (hit !== undefined) onSelect(hit);
							},
						)
					}
				/>
			</div>
			{content}
		</Modal>
	);
}
