import type { CreateTest } from "./endpoint/createTest.endpoint.ts";
import type { DeleteTest } from "./endpoint/deleteTest.endpoint.ts";
import type { GetAllTest } from "./endpoint/getAllTest.endpoint.ts";
import type { GetOneTest } from "./endpoint/getOneTest.endpoint.ts";
import type { UpdateTest } from "./endpoint/updateTest.endpoint.ts";

export type TestEndpointRegistry =
	| GetOneTest
	| GetAllTest
	| CreateTest
	| UpdateTest
	| DeleteTest;
