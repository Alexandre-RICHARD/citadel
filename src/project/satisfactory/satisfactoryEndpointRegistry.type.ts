import type { GetAllExtractors } from "./endpoint/getAllExtractors.endpoint.ts";
import type { GetAllFactories } from "./endpoint/getAllFactories.endpoint.ts";
import type { GetAllGenerators } from "./endpoint/getAllGenerators.endpoint.ts";
import type { GetExplorationSink } from "./endpoint/getExplorationSink.endpoint.ts";
import type { GetResourceSink } from "./endpoint/getResourceSink.endpoint.ts";

export type SatisfactoryEndpointRegistry =
	| GetAllExtractors
	| GetAllFactories
	| GetAllGenerators
	| GetExplorationSink
	| GetResourceSink;
