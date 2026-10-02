import type { CreateTest } from "./endpoint/createTestEndpoint.interface.ts";
import type { DeleteTest } from "./endpoint/deleteTestEndpoint.interface.ts";
import type { GetAllTest } from "./endpoint/getAllTestEndpoint.interface.ts";
import type { GetOneTest } from "./endpoint/getOneTestEndpoint.interface.ts";
import type { UpdateTest } from "./endpoint/updateTestEndpoint.interface.ts";

export type TestEndpointRegistry =
	GetOneTest | GetAllTest | CreateTest | UpdateTest | DeleteTest;
