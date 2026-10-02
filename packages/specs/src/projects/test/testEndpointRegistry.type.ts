import type { CreateTest } from "./endpoint/createTestEndpoint.type.ts";
import type { DeleteTest } from "./endpoint/deleteTestEndpoint.type.ts";
import type { GetAllTest } from "./endpoint/getAllTestEndpoint.type.ts";
import type { GetOneTest } from "./endpoint/getOneTestEndpoint.type.ts";
import type { UpdateTest } from "./endpoint/updateTestEndpoint.type.ts";

export type TestEndpointRegistry =
	GetOneTest | GetAllTest | CreateTest | UpdateTest | DeleteTest;
