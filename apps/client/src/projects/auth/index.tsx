import { Navigate, Route, Routes } from "react-router";

import { AppContainer } from "../../react/AppContainer";
import { Layout } from "./components/Layout/Layout";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { SecureAccountPage } from "./pages/SecureAccountPage";
import { VerifyPage } from "./pages/VerifyPage";
import { AuthPathEnum } from "./routing/authPath.enum";

// /auth/login, /auth/register, /auth/forgot-password, /auth/profile/<catégorie>, /auth/secure-account (étape facultative après
// l'inscription), /auth/verify (lien des emails) ; toute autre adresse mène à la connexion
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
						path="profile/*"
						element={<ProfilePage />}
					/>
					<Route
						path="secure-account"
						element={<SecureAccountPage />}
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
