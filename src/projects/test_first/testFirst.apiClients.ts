import { otherTestSpecs } from "@specs/otherTest.specs";
import { Zodios } from "@zodios/core";

export const apitestFirstApiClients = new Zodios(
	import.meta.env.VITE_API_ADRESS,
	otherTestSpecs,
);
