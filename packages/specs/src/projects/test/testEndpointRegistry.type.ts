import type { CreateTest } from "./endpoint/createTestEndpoint.ts";
import type { DeleteTest } from "./endpoint/deleteTestEndpoint.ts";
import type { GetAllTest } from "./endpoint/getAllTestEndpoint.ts";
import type { GetOneTest } from "./endpoint/getOneTestEndpoint.ts";
import type { UpdateTest } from "./endpoint/updateTestEndpoint.ts";

export type TestEndpointRegistry =
	GetOneTest | GetAllTest | CreateTest | UpdateTest | DeleteTest;
