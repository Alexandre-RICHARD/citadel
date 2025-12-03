import { Route, Routes } from "react-router";

import { TestDisplayAll } from "./pages/TestDisplayAll";
import { TestDisplayOne } from "./pages/TestDisplayOne";
import { TestLayout } from "./pages/TestLayout";

export function Test() {
	return (
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
	);
}
