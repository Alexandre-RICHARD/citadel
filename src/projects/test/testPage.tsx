import { Route, Routes } from "react-router";

import { AppContainer } from "../AppContainer";
import { TestDisplayAll } from "./pages/testDisplayAll/TestDisplayAll";
import { TestDisplayOne } from "./pages/testDisplayOne/TestDisplayOne";
import { TestLayout } from "./pages/TestLayout";

export function TestPage() {
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
