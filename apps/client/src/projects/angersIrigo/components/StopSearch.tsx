/* eslint-disable citadel/component-folder-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import "./StopSearch.scss";

import {
	type JSX,
	type KeyboardEvent,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";

import { GTFS_STATIC } from "../data/gtfs-static";
import { STOP_GROUP_BY_STOP_ID, STOP_GROUPS } from "../data/stop-groups";
import { useShapes } from "../hooks/useShapes";
import type { StopGroup } from "../types/stop";
import { createStopSearch } from "../utils/search";
import { getRoutesByStop } from "../utils/stops";
import { LineBadge } from "./LineBadge";

const MAX_RESULTS = 8;

const searchStops = createStopSearch(STOP_GROUPS);

function SearchIcon(): JSX.Element {
	return (
		<svg
			className="stop-search__icon"
			viewBox="0 0 24 24"
			width="18"
			height="18"
			aria-hidden="true"
		>
			<circle
				cx="10.5"
				cy="10.5"
				r="6.5"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<path
				d="M15.5 15.5L21 21"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
			/>
		</svg>
	);
}

type StopSearchProps = {
	/** Arrêt choisi : centrer la carte dessus et ouvrir sa popup */
	onSelect: (stop: StopGroup) => void;
};

/**
 * Champ de recherche d'arrêt avec suggestions (motif « combobox » de l'ARIA) : flèches pour
 * parcourir, Entrée pour choisir, Échap pour fermer puis effacer. Les lignes de chaque arrêt
 * départagent les homonymes ; elles s'affichent une fois les tracés chargés.
 */
export function StopSearch({ onSelect }: StopSearchProps): JSX.Element {
	const [query, setQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const listboxId = useId();

	const shapes = useShapes();
	const routesByStop = useMemo(
		() => shapes && getRoutesByStop(shapes, GTFS_STATIC, STOP_GROUP_BY_STOP_ID),
		[shapes],
	);
	const results = useMemo(() => searchStops(query, MAX_RESULTS), [query]);
	const isListVisible = isOpen && results.length > 0;
	const hasNoResult = isOpen && query.trim() !== "" && results.length === 0;

	function select(stop: StopGroup): void {
		onSelect(stop);
		setQuery(stop.name);
		setIsOpen(false);
		// Sur mobile, ferme le clavier qui cacherait la popup de l'arrêt
		inputRef.current?.blur();
	}

	function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
		switch (event.key) {
			case "ArrowDown":
			case "ArrowUp": {
				event.preventDefault();
				if (!isOpen) {
					setIsOpen(true);
					return;
				}
				const step = event.key === "ArrowDown" ? 1 : -1;
				setActiveIndex((index) =>
					Math.min(Math.max(index + step, 0), results.length - 1),
				);
				return;
			}
			case "Enter":
				if (isListVisible) {
					event.preventDefault();
					select(results[activeIndex]);
				}
				return;
			case "Escape":
				if (isOpen) {
					setIsOpen(false);
				} else {
					setQuery("");
				}
		}
	}

	return (
		<div className="stop-search">
			<SearchIcon />
			<input
				ref={inputRef}
				className="stop-search__input"
				type="text"
				enterKeyHint="search"
				autoComplete="off"
				spellCheck={false}
				placeholder="Rechercher un arrêt"
				aria-label="Rechercher un arrêt"
				role="combobox"
				aria-autocomplete="list"
				aria-expanded={isListVisible}
				aria-controls={listboxId}
				aria-activedescendant={
					isListVisible ? `${listboxId}-${activeIndex}` : undefined
				}
				value={query}
				onChange={(event) => {
					setQuery(event.target.value);
					setActiveIndex(0);
					setIsOpen(true);
				}}
				onFocus={() => setIsOpen(true)}
				onBlur={() => setIsOpen(false)}
				onKeyDown={handleKeyDown}
			/>
			{query && (
				<button
					type="button"
					className="stop-search__clear"
					aria-label="Effacer la recherche"
					onClick={() => {
						setQuery("");
						inputRef.current?.focus();
					}}
				>
					×
				</button>
			)}

			{/* Toujours présente (vide si fermée) : aria-controls doit désigner un élément existant */}
			<ul
				id={listboxId}
				role="listbox"
				aria-label="Arrêts trouvés"
				className="stop-search__results"
			>
				{isListVisible &&
					results.map((stop, index) => (
						// eslint-disable-next-line jsx-a11y/click-events-have-key-events -- le clavier passe par le champ de recherche (combobox)
						<li
							key={stop.id}
							id={`${listboxId}-${index}`}
							role="option"
							aria-selected={index === activeIndex}
							className="stop-search__result"
							// Garde le focus dans le champ : sinon il se fermerait avant le clic
							onMouseDown={(event) => event.preventDefault()}
							onMouseMove={() => setActiveIndex(index)}
							onClick={() => select(stop)}
						>
							<span className="stop-search__name">{stop.name}</span>
							<span className="stop-search__lines">
								{routesByStop?.get(stop.id)?.map((route) => (
									<LineBadge
										key={route.routeId}
										label={route.shortName}
										color={route.color}
										textColor={route.textColor}
										size="small"
									/>
								))}
							</span>
						</li>
					))}
			</ul>
			{hasNoResult && (
				<p
					className="stop-search__empty"
					role="status"
				>
					Aucun arrêt trouvé
				</p>
			)}
		</div>
	);
}
