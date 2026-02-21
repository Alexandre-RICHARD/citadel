import type { GetAllExtractors } from "./endpoint/getAllExtractors.endpoint.ts";
import type { GetAllFactories } from "./endpoint/getAllFactories.endpoint.ts";
import type { GetAllGenerators } from "./endpoint/getAllGenerators.endpoint.ts";


export type TestEndpointRegistry = GetAllExtractors | GetAllFactories | GetAllGenerators;
