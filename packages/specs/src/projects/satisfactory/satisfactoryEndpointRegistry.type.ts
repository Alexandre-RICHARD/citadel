import type { GetAllExtractors } from "./endpoint/getAllExtractorsEndpoint.type.ts";
import type { GetAllFactories } from "./endpoint/getAllFactoriesEndpoint.type.ts";
import type { GetAllGenerators } from "./endpoint/getAllGeneratorsEndpoint.type.ts";
import type { GetExplorationSink } from "./endpoint/getExplorationSinkEndpoint.type.ts";
import type { GetResourceSink } from "./endpoint/getResourceSinkEndpoint.type.ts";

export type SatisfactoryEndpointRegistry =
	| GetAllExtractors
	| GetAllFactories
	| GetAllGenerators
	| GetExplorationSink
	| GetResourceSink;
