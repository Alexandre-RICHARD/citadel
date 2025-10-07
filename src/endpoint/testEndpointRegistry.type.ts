import type { GetTest } from "./test/getTest.endpoint.ts";
import type { PostTest } from "./test/postTest.endpoint.ts";

export type TestEndpointRegistry = GetTest | PostTest;
