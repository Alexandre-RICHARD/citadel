import { useEffect } from "react";

// Le résultat actif reste visible quand la liste défile
export function useScrollIntoView(elementId: string | undefined): void {
	useEffect(() => {
		if (elementId !== undefined)
			document.getElementById(elementId)?.scrollIntoView({ block: "nearest" });
	}, [elementId]);
}
