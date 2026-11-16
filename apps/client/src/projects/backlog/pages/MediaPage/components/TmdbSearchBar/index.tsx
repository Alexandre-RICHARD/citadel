import { navigateResults } from "@citadel/common/src/browser/keyboard/navigateResults";
import { useActiveIndex } from "@citadel/common/src/react/hooks/useActiveIndex";
import { useDebouncedValue } from "@citadel/common/src/react/hooks/useDebouncedValue";
import { useScrollIntoView } from "@citadel/common/src/react/hooks/useScrollIntoView";
import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
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
import { useTmdbSearch } from "../../../../api/media/useTmdbSearch";
import type { TmdbHitFm } from "../../../../api/model/media/tmdbHitFm.type";
import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";
import { Spinner } from "../../../../components/Spinner";
import { UiDelayEnum } from "../../../../helper/timing/uiDelay.enum";
import { TmdbSearchResultOption } from "../TmdbSearchResultOption";

type Props = {
	// « / » y met le curseur, depuis toute la page
	inputRef: RefObject<HTMLInputElement | null>;
	onSelect: (hit: TmdbHitFm) => void;
};

/**
 * Recherche TMDB du backlog des films et séries, films et séries ensemble (§7.1), comme celle des jeux sur IGDB : le
 * curseur reste dans le champ, ↓ et ↑ parcourent les résultats, Entrée choisit, Échap ferme la liste
 */
export function TmdbSearchBar({ inputRef, onSelect }: Props) {
	const [query, setQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const debouncedQuery = useDebouncedValue(query, UiDelayEnum.TYPING_DEBOUNCE);
	const search = useTmdbSearch(debouncedQuery);
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

	// Le choix ouvre la modale d'ajout, qui rend le focus au champ en se fermant : un champ gardant sa saisie rouvrirait
	// la liste et relancerait la recherche. Il est donc vidé dès le choix
	function select(hit: TmdbHitFm) {
		setIsOpen(false);
		setQuery("");
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
				placeholder="Rechercher sur TMDB"
				aria-label="Rechercher un film ou une série sur TMDB"
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
								"rechercher sur TMDB",
								getErrorReason(search.error, {
									projectReasons: backlogErrorReasons,
								}),
							)}
						</p>
					)}
					{isSearching && results.length === 0 && (
						<p className={styles.listMessage}>
							<Spinner />
							Recherche sur TMDB…
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
							aria-label="Résultats TMDB"
							className={styles.resultList}
							// Le curseur reste dans le champ pendant le choix à la souris
							onMouseDown={(event) => event.preventDefault()}
						>
							{results.map((hit, index) => (
								<TmdbSearchResultOption
									key={`${hit.mediaType}-${hit.tmdbId}`}
									id={`${listId}-${index}`}
									hit={hit}
									isActive={index === activeIndex}
									badge={
										hit.userMediaId !== null && (
											<span
												className={joinClassNames(
													styles.badge,
													styles.toneGreen,
												)}
											>
												<Database aria-hidden />
												Dans le backlog
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
