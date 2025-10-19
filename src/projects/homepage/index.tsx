import { regex } from "../../common/dictionnaries/regex";
import { useGetProjectSubPath } from "../../common/hooks/navigation/useGetProjectSubPath";
import { TestDisplayAll } from "./components/TestDisplayAll";
import { TestDisplayOne } from "./components/TestDisplayOne";

export function Homepage() {
	const subPath = useGetProjectSubPath();

	if (subPath === null) return <TestDisplayAll />;
	if (regex.containsOnlyNumbers.test(subPath)) return <TestDisplayOne />;
	return null;
}
