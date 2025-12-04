import { Route, Routes } from "react-router";

import { AppContainer } from "../AppContainer";
import { MainPage } from "./pages/mainPage/MainPage";
import { SatisfactoryLayout } from "./pages/SatisfactoryLayout";

export function SatisfactoryPage() {
	return (
		<AppContainer>
			<Routes>
				<Route element={<SatisfactoryLayout />}>
					<Route
						index
						element={<MainPage />}
					/>
				</Route>
			</Routes>
		</AppContainer>
	);
}
