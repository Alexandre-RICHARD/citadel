import { regex } from "../../common/dictionnaries/regex";
import { useGetProjectSubPath } from "../../common/hooks/navigation/useGetProjectSubPath";
import { TestDisplayAll } from "./pages/TestDisplayAll";
import { TestDisplayOne } from "./pages/TestDisplayOne";

export function Test() {
	const subPath = useGetProjectSubPath();

	if (subPath === null) return <TestDisplayAll />;
	if (regex.containsOnlyNumbers.test(subPath)) return <TestDisplayOne />;
	return null;
}
