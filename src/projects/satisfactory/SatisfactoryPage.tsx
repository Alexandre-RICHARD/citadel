import { Route, Routes } from "react-router";

import { AppContainer } from "../AppContainer";
import { TranslationsContext } from "./nexus/react/contexts/translations/Translations.context";
import { TranslationProvider } from "./nexus/react/contexts/translations/Translations.provider";
import { FactoryLineCalculator } from "./react/pages/FactoryLineCalculator";
import { FRMAllMachines } from "./react/pages/FRMAllMachines";
import { Homepage } from "./react/pages/Homepage";
import { NotFound } from "./react/pages/NotFound";
import { RecipesList } from "./react/pages/RecipesList";
import { SatisfactoryLayout } from "./react/SatisfactoryLayout";
import { useCombinedStore } from "./store/combined.store";

export function SatisfactoryPage() {
	const language = useCombinedStore((state) => state.language);

	const filesContexts = {
		...import.meta.glob("./assets/translations/**/*.ts"),
	};
	return (
		<TranslationProvider
			TranslationsContext={TranslationsContext}
			filesContexts={filesContexts}
			language={language}
		>
			<AppContainer>
				<Routes>
					<Route
						path="/"
						element={<SatisfactoryLayout />}
					>
						<Route
							index
							element={<Homepage />}
						/>
						<Route
							path="recipes"
							element={<RecipesList />}
						/>
						<Route
							path="calculator"
							element={<FactoryLineCalculator />}
						/>
						<Route
							path="frm/allMachines"
							element={<FRMAllMachines />}
						/>
						<Route
							path="*"
							element={<NotFound />}
						/>
					</Route>
				</Routes>
			</AppContainer>
		</TranslationProvider>
	);
}
