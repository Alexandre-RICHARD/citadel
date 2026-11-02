import { Navigate, Route, Routes } from "react-router";

import { AppContainer } from "../../react/AppContainer";
import { Layout } from "./components/Layout/Layout";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { VerifyPage } from "./pages/VerifyPage";
import { AuthPathEnum } from "./routing/authPath.enum";

// /auth/login, /auth/register, /auth/forgot-password, /auth/verify (lien des mails) ; toute autre adresse mène à la
// connexion
export function Auth() {
	return (
		<AppContainer>
			<Routes>
				<Route element={<Layout />}>
					<Route
						path="login"
						element={<LoginPage />}
					/>
					<Route
						path="register"
						element={<RegisterPage />}
					/>
					<Route
						path="forgot-password"
						element={<ForgotPasswordPage />}
					/>
					<Route
						path="verify"
						element={<VerifyPage />}
					/>
					<Route
						path="*"
						element={
							<Navigate
								to={AuthPathEnum.LOGIN}
								replace
							/>
						}
					/>
				</Route>
			</Routes>
		</AppContainer>
	);
}
