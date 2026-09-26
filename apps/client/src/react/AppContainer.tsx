import type { ReactNode } from "react";

import { useAppNavigation } from "./appNavigation/useAppNavigation";

type Props = {
	children: ReactNode;
};

export function AppContainer({ children }: Props) {
	useAppNavigation();

	return children;
}
