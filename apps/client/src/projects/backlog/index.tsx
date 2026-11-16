import { Navigate, Route, Routes, useLocation } from "react-router";

import { AppContainer } from "../../react/AppContainer";
import { Layout } from "./components/Layout/Layout";
import { Homepage } from "./pages/Homepage";
import { MediaPage } from "./pages/MediaPage";
import { BacklogPathEnum } from "./routing/backlogPath.enum";

// `/backlog` mène aux jeux en gardant ses paramètres : les anciens liens (tri, filtres) marchent encore
function RedirectToGames() {
	const { search, hash } = useLocation();
	return (
		<Navigate
			to={`${BacklogPathEnum.GAMES}${search}${hash}`}
			replace
		/>
	);
}

export function Backlog() {
	return (
		<AppContainer>
			<Routes>
				<Route
					path=""
					element={<Layout />}
				>
					<Route
						index
						element={<RedirectToGames />}
					/>
					<Route
						path="games"
						element={<Homepage />}
					/>
					<Route
						path="media"
						element={<MediaPage />}
					/>
					<Route
						path="*"
						element={<RedirectToGames />}
					/>
				</Route>
			</Routes>
		</AppContainer>
	);
}
