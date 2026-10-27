import "../../ambiance/ambianceProperties.scss";

import { usePrefersReducedMotion } from "@citadel/common/src/react/hooks/usePrefersReducedMotion";
import { useSessionStorage } from "@citadel/common/src/react/hooks/useSessionStorage";
import { ColorSchemeEnum } from "@citadel/design-system/src/theme/colorScheme/colorScheme.enum";
import { resolveAmbianceTheme } from "@citadel/design-system/src/theme/resolveAmbianceTheme";
import { ThemeProvider } from "@citadel/design-system/src/theme/ThemeProvider";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";

import { ProjectsEnum } from "../../../../react/appNavigation/projects.enum";
import { projects } from "../../../../react/appNavigation/projectsDictionary";
import { projectTransitionStore } from "../../../../react/appNavigation/projectTransition/projectTransitionStore";
import { AppToaster } from "../../../../react/AppToaster";
import { ProjectThemeProvider } from "../../../../react/projectTheme/ProjectThemeProvider";
import { useProjectColorScheme } from "../../../../react/projectTheme/useProjectColorScheme";
import { buildAmbianceStyle } from "../../ambiance/buildAmbianceStyle";
import { pickAmbianceFonts } from "../../ambiance/pickAmbianceFonts";
import { useAmbianceDuration } from "../../ambiance/useAmbianceDuration";
import { useReskin } from "../../ambiance/useReskin";
import { footerPages } from "../../content/footerPages";
import { useIsNarrow } from "../../hooks/useIsNarrow";
import { useViewSwitch } from "../../hooks/useViewSwitch";
import { FooterPage } from "../../pages/FooterPage";
import { Showcase } from "../../pages/Showcase";
import { buildHomepagePath } from "../../routing/buildHomepagePath";
import { getProjectSlug } from "../../routing/getProjectSlug";
import { resolveHomepageView } from "../../routing/resolveHomepageView";
import { showcaseProjects } from "../../routing/showcaseProjects";
import { Background } from "../Background";
import { Footer } from "../Footer";
import { Header } from "../Header";
import { Intro } from "../Intro";
import styles from "./layout.module.scss";

// L'intro ne se joue qu'une fois par session
const INTRO_SEEN_KEY = "citadel:homepage:intro";
const homepage = projects[ProjectsEnum.Homepage];

// La homepage : un fond animé sur toute la page, le header, le conteneur principal qui défile (la vitrine des projets
// ou une page du footer) et le footer. Toute la page prend l'ambiance du projet sélectionné : ses couleurs glissent,
// ses polices changent en fondu, son fond animé apparaît
export function Layout() {
	const { slug } = useParams();
	const navigate = useNavigate();
	const rootRef = useRef<HTMLDivElement>(null);
	const headerLogoRef = useRef<SVGSVGElement>(null);
	const mainRef = useRef<HTMLElement>(null);
	const showcaseViewRef = useRef<HTMLDivElement>(null);
	const pageViewRef = useRef<HTMLDivElement>(null);

	const { colorScheme, toggleColorScheme } = useProjectColorScheme(
		ProjectsEnum.Homepage,
	);
	const reducedMotion = usePrefersReducedMotion();
	const isNarrow = useIsNarrow(rootRef);

	// Une adresse inconnue repart vers l'accueil
	const view = resolveHomepageView(slug, showcaseProjects, footerPages);
	const selectedProject = view.kind === "project" ? view.project : null;
	const isPage = view.kind === "page";

	// L'ambiance : celle du projet sélectionné, sinon celle de la Citadel (accueil et pages du footer)
	const ambianceProject = selectedProject ?? homepage;
	const ambianceTheme = useMemo(
		() => resolveAmbianceTheme(ambianceProject.theme, colorScheme),
		[ambianceProject, colorScheme],
	);
	const ambianceFonts = useMemo(
		() => pickAmbianceFonts(ambianceTheme),
		[ambianceTheme],
	);
	const displayedFonts = useReskin(rootRef, ambianceFonts, reducedMotion);
	const ambianceDuration = useAmbianceDuration(
		ambianceProject.id,
		colorScheme,
		reducedMotion,
	);

	// La présentation d'où l'on vient, pour y revenir depuis une page du footer ; la page affichée reste en place
	// pendant que la vue s'efface
	const showcaseSlug = selectedProject ? getProjectSlug(selectedProject) : "";
	const [lastShowcaseSlug, setLastShowcaseSlug] = useState(showcaseSlug);
	if (!isPage && lastShowcaseSlug !== showcaseSlug)
		setLastShowcaseSlug(showcaseSlug);
	const page = view.kind === "page" ? view.page : null;
	const [displayedPage, setDisplayedPage] = useState(page);
	if (page && page !== displayedPage) setDisplayedPage(page);
	const backPath = buildHomepagePath(lastShowcaseSlug);

	const { value: hasSeenIntro, set: setHasSeenIntro } =
		useSessionStorage<boolean>(INTRO_SEEN_KEY, false);
	// Décidé à l'arrivée : marquer l'intro comme vue ne l'interrompt pas. Revenu d'un projet, sous sa transition,
	// on la saute
	const [isIntroPlaying] = useState(
		() =>
			!hasSeenIntro && !reducedMotion && !projectTransitionStore.isRunning(),
	);
	const [isRevealed, setIsRevealed] = useState(!isIntroPlaying);
	const handleIntroReveal = useCallback(() => setIsRevealed(true), []);
	const handleIntroDone = useCallback(
		() => setHasSeenIntro(true),
		[setHasSeenIntro],
	);

	useViewSwitch({
		showcaseRef: showcaseViewRef,
		pageRef: pageViewRef,
		scrollerRef: mainRef,
		isPage,
		reducedMotion,
	});

	// Le nom du site, précédé du projet ou de la page affichée
	const documentTitle =
		view.kind === "project"
			? `${view.project.name} · ${homepage.documentTitle}`
			: view.kind === "page"
				? `${view.page.title} · ${homepage.documentTitle}`
				: homepage.documentTitle;
	useEffect(() => {
		document.title = documentTitle;
	}, [documentTitle]);

	// Échap ferme une page du footer et revient à la présentation d'où l'on venait
	useEffect(() => {
		if (!isPage) return undefined;
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key !== "Escape") return;
			event.preventDefault();
			void navigate(backPath);
		}
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isPage, backPath, navigate]);

	if (view.kind === "unknown")
		return (
			<Navigate
				to={buildHomepagePath()}
				replace
			/>
		);

	return (
		<ProjectThemeProvider project={ProjectsEnum.Homepage}>
			{/* Les composants du design system (toasts) prennent l'ambiance */}
			<ThemeProvider theme={ambianceTheme}>
				<div
					ref={rootRef}
					className={styles.homepage}
					style={buildAmbianceStyle(
						ambianceTheme,
						displayedFonts,
						ambianceDuration,
					)}
				>
					<Background
						theme={ambianceTheme}
						effect={selectedProject?.showcase.backgroundEffect ?? null}
						isDark={colorScheme === ColorSchemeEnum.Dark}
						durationSeconds={ambianceDuration}
						reducedMotion={reducedMotion}
						isNarrow={isNarrow}
					/>
					<div className={styles.interface}>
						<Header
							logoRef={headerLogoRef}
							colorScheme={colorScheme}
							onToggleColorScheme={toggleColorScheme}
						/>
						<main
							ref={mainRef}
							className={styles.main}
						>
							<div
								ref={showcaseViewRef}
								className={styles.view}
							>
								<Showcase
									selectedProject={selectedProject}
									isNarrow={isNarrow}
									isRevealed={isRevealed}
									reducedMotion={reducedMotion}
								/>
							</div>
							<div
								ref={pageViewRef}
								className={styles.view}
							>
								{displayedPage && (
									<FooterPage
										page={displayedPage}
										backPath={backPath}
									/>
								)}
							</div>
						</main>
						<Footer />
					</div>
					{isIntroPlaying && (
						<Intro
							headerLogoRef={headerLogoRef}
							onReveal={handleIntroReveal}
							onDone={handleIntroDone}
						/>
					)}
				</div>
				<AppToaster />
			</ThemeProvider>
		</ProjectThemeProvider>
	);
}
