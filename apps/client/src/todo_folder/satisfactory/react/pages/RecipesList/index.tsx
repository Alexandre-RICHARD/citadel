import { CheckboxInput } from "@citadel/design-system/src/atoms/CheckboxInput";
import { RangeInput } from "@citadel/design-system/src/atoms/RangeInput";
import { TextInput } from "@citadel/design-system/src/atoms/TextInput";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { recipes } from "../../../dictionnaries/recipes.dictionnary";
import { useCombinedStore } from "../../../store/combined.store";
import { Recipe } from "../../components/Recipe";
import styles from "./styles.module.scss";
import { useGetFilteredRecipes } from "./useGetFilteredRecipes";

export function RecipesList(): React.JSX.Element {
	const [
		minuteCalculation,
		setMinuteCalculation,
		overclocking,
		setOverclocking,
		nameFilter,
		setNameFilter,
	] = useCombinedStore(
		useShallow((state) => [
			state.minuteCalculation,
			state.setMinuteCalculation,
			state.overclocking,
			state.setOverclocking,
			state.nameFilter,
			state.setNameFilter,
		]),
	);

	const filteredRecipes = useGetFilteredRecipes({
		recipes: Object.values(recipes),
		searchString: nameFilter,
	});

	return (
		<>
			<div className={styles.input_container}>
				<CheckboxInput
					// TODO T => Instaurer les data-testid (pour tous les input)
					id="checkbox_minutes"
					value={minuteCalculation}
					onChange={setMinuteCalculation}
					// TODO T => Continuer la transition dumb/smart component
					// TODO T => Traduire (pour tous les input)
					label="Minutes or not"
				/>
				<RangeInput
					id="range_overclocking"
					value={overclocking}
					min={1}
					max={250}
					step={1}
					unit="%"
					onChange={setOverclocking}
					label="Overclocking"
				/>
				<TextInput
					id="list_name_filter"
					value={nameFilter}
					onChange={setNameFilter}
					label="Filtre par nom"
				/>
			</div>
			<div className={styles.recipes}>
				{filteredRecipes.map((recipe) => (
					<Recipe
						key={recipe.recipeName}
						recipe={recipe}
					/>
				))}
			</div>
		</>
	);
}
