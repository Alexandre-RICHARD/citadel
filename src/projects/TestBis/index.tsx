import { Route, Routes } from "react-router";

import { AppContainer } from "../../react/AppContainer";
import { Layout } from "./components/Layout";
import { TestDisplayAll } from "./pages/TestDisplayAll";
import { TestDisplayOne } from "./pages/TestDisplayOne";

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
