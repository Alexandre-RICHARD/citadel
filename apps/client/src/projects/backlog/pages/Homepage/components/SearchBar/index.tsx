import { CircleAlert, Database, Search, SearchX, X } from "lucide-react";
import {
	type ReactNode,
	type RefObject,
	useEffect,
	useId,
	useState,
} from "react";

import { buildFailureMessage } from "../../../../../../common/api/error/buildFailureMessage";
import { getErrorReason } from "../../../../../../common/api/error/getErrorReason";
import { backlogErrorReasons } from "../../../../api/backlogErrorReasons";
import { useIgdbSearch } from "../../../../api/igdb/useIgdbSearch";
import type { GameHitFm } from "../../../../api/model/gameHitFm.type";
import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";
import { Spinner } from "../../../../components/Spinner";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";
import { navigateResults } from "../../../../helper/list/navigateResults";
import { UiDelayEnum } from "../../../../helper/timing/uiDelay.enum";
import { useActiveIndex } from "../../../../hooks/useActiveIndex";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue";
import { useScrollIntoView } from "../../../../hooks/useScrollIntoView";
import { SearchResultOption } from "../SearchResultOption";

type Props = {
	// « / » y met le curseur, depuis toute la page
	inputRef: RefObject<HTMLInputElement | null>;
	onSelect: (hit: GameHitFm) => void;
};

/**
 * Recherche sur IGDB seulement ; les jeux en base hors backlog passent par « Ma base ».
 * Le curseur reste dans le champ : ↓ et ↑ parcourent les résultats, Entrée choisit, Échap ferme la liste
 */
export function SearchBar({ inputRef, onSelect }: Props) {
	const [query, setQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const debouncedQuery = useDebouncedValue(query, UiDelayEnum.TYPING_DEBOUNCE);
	const search = useIgdbSearch(debouncedQuery);
	const { results } = search;
	const isSearching =
		search.isSearching || query.trim() !== debouncedQuery.trim();
	const listId = useId();
	// Une nouvelle recherche repart sans résultat actif
	const [activeIndex, setActiveIndex] = useActiveIndex(debouncedQuery);
	const isListShown = isOpen && query.trim() !== "";
	const activeResultId =
		isListShown && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined;
	useScrollIntoView(activeResultId);

	// Un clic hors de la barre ferme la liste ; revenir dans le champ la rouvre
	useEffect(() => {
		if (!isOpen) return undefined;
		function closeOnOutsideClick(event: PointerEvent) {
			if (!(
				event.target instanceof Element &&
				event.target.closest("[data-search]") !== null
			))
				setIsOpen(false);
		}
		document.addEventListener("pointerdown", closeOnOutsideClick);
		return () =>
			document.removeEventListener("pointerdown", closeOnOutsideClick);
	}, [isOpen]);

	function select(hit: GameHitFm) {
		setIsOpen(false);
		onSelect(hit);
	}

	let fieldEnd: ReactNode = (
		<kbd
			className={styles.searchShortcut}
			aria-hidden
		>
			/
		</kbd>
	);
	if (isSearching && query.trim() !== "")
		fieldEnd = <Spinner className={styles.searchSpinner} />;
	else if (query !== "")
		fieldEnd = (
			<Button
				icon={X}
				variant="ghost"
				size="sm"
				ariaLabel="Effacer la recherche"
				className={styles.searchClear}
				onClick={() => {
					setQuery("");
					inputRef.current?.focus();
				}}
			/>
		);

	return (
		<div
			className={styles.search}
			data-search
		>
			<Search
				className={styles.searchIcon}
				aria-hidden
			/>
			<input
				ref={inputRef}
				type="search"
				role="combobox"
				className={styles.searchInput}
				placeholder="Rechercher un jeu sur IGDB"
				aria-label="Rechercher un jeu sur IGDB"
				aria-expanded={isListShown}
				aria-controls={isListShown ? listId : undefined}
				aria-autocomplete="list"
				aria-activedescendant={activeResultId}
				value={query}
				onChange={(event) => {
					setQuery(event.target.value);
					setIsOpen(true);
				}}
				onFocus={() => setIsOpen(true)}
				onKeyDown={(event) => {
					if (event.key === "Escape") setIsOpen(false);
					else if (!isOpen && event.key === "ArrowDown") setIsOpen(true);
					else if (isListShown)
						navigateResults(
							event,
							activeIndex,
							results.length,
							setActiveIndex,
							() => {
								const hit = results.at(activeIndex);
								if (hit !== undefined) select(hit);
							},
						);
				}}
			/>
			{fieldEnd}
			{isListShown && (
				<div className={styles.searchPanel}>
					{search.error !== null && (
						<p
							className={joinClassNames(
								styles.listMessage,
								styles.errorMessage,
							)}
							role="alert"
						>
							<CircleAlert aria-hidden />
							{buildFailureMessage(
								"rechercher sur IGDB",
								getErrorReason(search.error, {
									projectReasons: backlogErrorReasons,
								}),
							)}
						</p>
					)}
					{isSearching && results.length === 0 && (
						<p className={styles.listMessage}>
							<Spinner />
							Recherche sur IGDB…
						</p>
					)}
					{!isSearching && search.error === null && results.length === 0 && (
						<p className={styles.listMessage}>
							<SearchX aria-hidden />
							Aucun résultat pour « {query.trim()} »
						</p>
					)}
					{results.length > 0 && (
						<ul
							id={listId}
							role="listbox"
							aria-label="Résultats IGDB"
							className={styles.resultList}
							// Le curseur reste dans le champ pendant le choix à la souris
							onMouseDown={(event) => event.preventDefault()}
						>
							{results.map((hit, index) => (
								<SearchResultOption
									key={hit.id}
									id={`${listId}-${index}`}
									hit={hit}
									isActive={index === activeIndex}
									badge={
										hit.storedGameId !== null && (
											<span
												className={joinClassNames(
													styles.badge,
													styles.toneGreen,
												)}
											>
												<Database aria-hidden />
												{hit.isInBacklog ? "Dans le backlog" : "Déjà en base"}
											</span>
										)
									}
									onHover={() => setActiveIndex(index)}
									onSelect={select}
								/>
							))}
						</ul>
					)}
				</div>
			)}
		</div>
	);
}
