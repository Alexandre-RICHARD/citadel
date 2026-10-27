import { useMediaQuery } from "./useMediaQuery.tsx";

// L'utilisateur a demandé à son système de réduire les animations
export function usePrefersReducedMotion(): boolean {
	return useMediaQuery("(prefers-reduced-motion: reduce)");
}
