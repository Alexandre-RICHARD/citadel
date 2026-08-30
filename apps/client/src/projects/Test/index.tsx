import { Route, Routes } from "react-router";

import { AppContainer } from "../../react/AppContainer.tsx";
import { Layout } from "./components/Layout/index.tsx";
import { TestDisplayAll } from "./pages/TestDisplayAll/index.tsx";
import { TestDisplayOne } from "./pages/TestDisplayOne/index.tsx";

export function Test() {
	return (
		<AppContainer>
			<Routes>
				<Route
					path=""
					element={<Layout />}
				>
					<Route
						index
						element={<TestDisplayAll />}
					/>
					<Route
						path=":id"
						element={<TestDisplayOne />}
					/>
				</Route>
			</Routes>
		</AppContainer>
	);
}
