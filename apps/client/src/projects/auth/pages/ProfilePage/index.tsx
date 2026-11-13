import { SideNavigation } from "@citadel/design-system/src/organisms/SideNavigation";
import type { SideNavigationEntry } from "@citadel/design-system/src/organisms/SideNavigation/sideNavigationEntry.type";
import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum";
import {
	Navigate,
	Route,
	Routes,
	useLocation,
	useNavigate,
} from "react-router";

import { useNewRecoveryCodes } from "../../api/cache/useNewRecoveryCodes";
import { useFlow } from "../../api/flow/useFlow";
import { useMe } from "../../api/me/useMe";
import { MailCodeStep } from "../../components/MailCodeStep";
import { PageLoading } from "../../components/PageLoading";
import { ProfileSection } from "../../components/ProfileSection";
import { RecoveryCodesDialog } from "../../components/RecoveryCodesDialog";
import { buildLoginPath } from "../../routing/buildLoginPath";
import { buildProfilePath } from "../../routing/buildProfilePath";
import { ProfileCategoryEnum } from "../../routing/profileCategory.enum";
import { NavigationUser } from "./components/NavigationUser";
import { ProfileCategoryContent } from "./components/ProfileCategoryContent";
import { PROFILE_CATEGORIES } from "./profileCategories";
import styles from "./profilePage.module.scss";

// Où ce navigateur retient si le menu du profil est déplié
const NAVIGATION_STORAGE_KEY = "citadel:auth:profileNavigation";

// Le profil : tout ce que le compte permet de changer, rangé en catégories (une adresse chacune) qu'un menu à gauche
// propose. Un parcours du profil en cours (nouvelle adresse email, code par email à activer) prend la place de la page
// jusqu'à la saisie du code ou du lien ; les codes de secours qui viennent d'être donnés s'affichent dans une fenêtre
// au-dessus de la page, car ils ne reviendront pas
export function ProfilePage() {
	const me = useMe();
	const { flow } = useFlow();
	const { recoveryCodes, acknowledge } = useNewRecoveryCodes();
	const { pathname } = useLocation();
	const navigate = useNavigate();

	if (me === undefined || flow === undefined) return <PageLoading />;
	if (me === null)
		return (
			<Navigate
				to={buildLoginPath(pathname)}
				replace
			/>
		);

	if (flow?.kind === FlowKindEnum.EMAIL_CHANGE)
		return (
			<MailCodeStep
				flow={flow}
				title="Confirmez votre nouvelle adresse email"
				lead="Un email vient de partir à la nouvelle adresse."
				purpose="pour confirmer cette adresse"
			/>
		);
	if (flow?.kind === FlowKindEnum.EMAIL_FACTOR)
		return (
			<MailCodeStep
				flow={flow}
				title="Activez le code par email"
				lead="Un email vient de partir à l’adresse de votre compte."
				purpose="pour activer le code par email"
			/>
		);

	const current = PROFILE_CATEGORIES.find(
		({ category }) => buildProfilePath(category) === pathname,
	);
	const entries: SideNavigationEntry[] = [
		{
			kind: "custom",
			id: "user",
			render: (isWide) => (
				<NavigationUser
					me={me}
					isWide={isWide}
				/>
			),
		},
		...PROFILE_CATEGORIES.map(({ category, label, icon }) => ({
			kind: "link" as const,
			id: category,
			label,
			icon,
			href: buildProfilePath(category),
			isActive: category === current?.category,
		})),
	];

	return (
		<div className={styles.page}>
			{recoveryCodes !== null && (
				<RecoveryCodesDialog
					codes={recoveryCodes}
					email={me.email}
					onAcknowledge={acknowledge}
				/>
			)}
			<h1 className={styles.title}>Votre profil</h1>
			<SideNavigation
				label="Catégories du profil"
				entries={entries}
				onNavigate={(href) => {
					void navigate(href);
				}}
				storageKey={NAVIGATION_STORAGE_KEY}
				compactBar={
					current !== undefined && (
						<span className={styles.compactTitle}>
							<current.icon
								size={18}
								strokeWidth={2}
							/>
							{current.label}
						</span>
					)
				}
			>
				<Routes>
					{PROFILE_CATEGORIES.map(({ category, label, icon: Icon, lead }) => (
						<Route
							key={category}
							path={category}
							element={
								<ProfileSection
									icon={<Icon />}
									title={label}
									lead={lead}
								>
									<ProfileCategoryContent
										category={category}
										me={me}
									/>
								</ProfileSection>
							}
						/>
					))}
					<Route
						path="*"
						element={
							<Navigate
								to={buildProfilePath(ProfileCategoryEnum.IDENTITY)}
								replace
							/>
						}
					/>
				</Routes>
			</SideNavigation>
		</div>
	);
}
