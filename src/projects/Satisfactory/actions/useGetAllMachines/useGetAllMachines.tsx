import { useGetAllExtractors } from "./useGetAllExtractors/useGetAllExtractors.tsx";
import { useGetAllFactories } from "./useGetAllFactories/useGetAllFactories.tsx";
import { useGetAllGenerators } from "./useGetAllGenerators/useGetAllGenerators.tsx";

export function useGetAllMachines() {
	const { data: extractors } = useGetAllExtractors();
	const { data: factories } = useGetAllFactories();
	const { data: generators } = useGetAllGenerators();

	return [...extractors, ...factories, ...generators];
}
