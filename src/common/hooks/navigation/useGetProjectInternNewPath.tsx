import { useCallback } from "react";
import { useMatches } from "react-router";

import type { RouteMeta } from "../../../routing/routeMeta.type";

export function useGetProjectInternNewPath() {
	const matches = useMatches();

	return useCallback(
		(subPath?: string): string => {
			const currentProjectMatch = matches.at(-1);
			if (!currentProjectMatch) return subPath ?? "";
			const currentProjectBasePath = (currentProjectMatch.handle as RouteMeta)
				.basePath;
			if (!subPath) return currentProjectBasePath;
			const newProjectPath = `${currentProjectBasePath}/${subPath}`;
			return newProjectPath;
		},
		[matches],
	);
}
