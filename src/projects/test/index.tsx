import { Route, Routes } from "react-router";

import { AppContainer } from "../AppContainer";
import { TestDisplayAll } from "./pages/TestDisplayAll";
import { TestDisplayOne } from "./pages/TestDisplayOne";
import { TestLayout } from "./pages/TestLayout";

export function Test() {
	return (
		<AppContainer>
			<Routes>
				<Route element={<TestLayout />}>
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
