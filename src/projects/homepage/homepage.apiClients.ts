import { testSpecs } from "@specs/test.specs";
import { Zodios } from "@zodios/core";

export const homepageApiClients = new Zodios(
	import.meta.env.VITE_API_ADRESS,
	testSpecs,
);
