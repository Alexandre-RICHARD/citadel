import { type RefObject, useLayoutEffect, useRef } from "react";

import { switchView } from "../effects/views/switchView";

type Options = {
	showcaseRef: RefObject<HTMLElement | null>;
	pageRef: RefObject<HTMLElement | null>;
	// Le conteneur qui défile : il revient en haut à chaque changement de vue
	scrollerRef: RefObject<HTMLElement | null>;
	isPage: boolean;
	reducedMotion: boolean;
};

// La présentation des projets et les pages du footer restent montées : on passe de l'une à l'autre en fondu,
// et la roue retrouve son état en revenant. Seul ce hook décide laquelle est masquée (attribut hidden)
export function useViewSwitch({
	showcaseRef,
	pageRef,
	scrollerRef,
	isPage,
	reducedMotion,
}: Options): void {
	const shownView = useRef<"page" | "showcase" | null>(null);

	useLayoutEffect(() => {
		const showcase = showcaseRef.current;
		const page = pageRef.current;
		if (!showcase || !page) return undefined;
		const nextView = isPage ? "page" : "showcase";

		// À l'arrivée : la bonne vue, sans animation
		if (shownView.current === null) {
			shownView.current = nextView;
			showcase.hidden = isPage;
			page.hidden = !isPage;
			return undefined;
		}
		if (shownView.current === nextView) return undefined;
		shownView.current = nextView;

		const timeline = switchView({
			from: isPage ? showcase : page,
			to: isPage ? page : showcase,
			isTowardPage: isPage,
			reducedMotion,
			onSwap() {
				scrollerRef.current?.scrollTo({ top: 0 });
			},
		});
		return () => {
			timeline.kill();
		};
	}, [showcaseRef, pageRef, scrollerRef, isPage, reducedMotion]);
}
