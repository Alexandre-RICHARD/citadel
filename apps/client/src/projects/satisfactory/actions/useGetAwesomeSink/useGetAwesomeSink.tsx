import { awesomeSinkDtoToFmMapper } from "./awesomeSinkDtoToFmMapper";
import { useGetExplorationSink } from "./useGetExplorationSink";
import { useGetResourceSink } from "./useGetResourceSink";

export function useGetAwesomeSink() {
	const { data: explorationSinkDto } = useGetExplorationSink();
	const { data: resourceSinkDto } = useGetResourceSink();

	return awesomeSinkDtoToFmMapper(
		explorationSinkDto?.data,
		resourceSinkDto?.data,
	);
}
