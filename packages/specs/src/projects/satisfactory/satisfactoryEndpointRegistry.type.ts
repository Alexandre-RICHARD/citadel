import type { GetAllExtractors } from "./endpoint/getAllExtractorsEndpoint.interface.ts";
import type { GetAllFactories } from "./endpoint/getAllFactoriesEndpoint.interface.ts";
import type { GetAllGenerators } from "./endpoint/getAllGeneratorsEndpoint.interface.ts";
import type { GetExplorationSink } from "./endpoint/getExplorationSinkEndpoint.interface.ts";
import type { GetResourceSink } from "./endpoint/getResourceSinkEndpoint.interface.ts";

export type SatisfactoryEndpointRegistry =
	| GetAllExtractors
	| GetAllFactories
	| GetAllGenerators
	| GetExplorationSink
	| GetResourceSink;
