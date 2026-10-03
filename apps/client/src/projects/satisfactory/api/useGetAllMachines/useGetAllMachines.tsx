import { useGetAllExtractors } from "./useGetAllExtractors/useGetAllExtractors";
import { useGetAllFactories } from "./useGetAllFactories/useGetAllFactories";
import { useGetAllGenerators } from "./useGetAllGenerators/useGetAllGenerators";

export function useGetAllMachines() {
	const { data: extractors } = useGetAllExtractors();
	const { data: factories } = useGetAllFactories();
	const { data: generators } = useGetAllGenerators();

	return [...extractors, ...factories, ...generators];
}
