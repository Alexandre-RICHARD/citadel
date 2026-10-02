import type { GetAllExtractors } from "./endpoint/getAllExtractorsEndpoint.ts";
import type { GetAllFactories } from "./endpoint/getAllFactoriesEndpoint.ts";
import type { GetAllGenerators } from "./endpoint/getAllGeneratorsEndpoint.ts";
import type { GetExplorationSink } from "./endpoint/getExplorationSinkEndpoint.ts";
import type { GetResourceSink } from "./endpoint/getResourceSinkEndpoint.ts";

export type SatisfactoryEndpointRegistry =
	| GetAllExtractors
	| GetAllFactories
	| GetAllGenerators
	| GetExplorationSink
	| GetResourceSink;
