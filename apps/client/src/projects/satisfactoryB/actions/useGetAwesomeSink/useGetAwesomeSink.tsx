import { awesomeSinkDtoToFmMapper } from "./awesomeSinkDtoToFm.mapper.ts";
import { useGetExplorationSink } from "./useGetExplorationSink.tsx";
import { useGetResourceSink } from "./useGetResourceSink.tsx";

export function useGetAwesomeSink() {
	const { data: explorationSinkDto } = useGetExplorationSink();
	const { data: resourceSinkDto } = useGetResourceSink();

	return awesomeSinkDtoToFmMapper(
		explorationSinkDto?.data,
		resourceSinkDto?.data,
	);
}
