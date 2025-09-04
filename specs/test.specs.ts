import { makeApi } from "@zodios/core";
import z from "zod";

const test = z.object({
	id: z.number(),
	name: z.string(),
	isActive: z.boolean(),
});

export const testSpecs = makeApi([
	{
		method: "get",
		path: "/test/all",
		response: z.array(test),
		alias: "getTests",
		description: "Get all test datas",
	},
	{
		method: "get",
		path: "/test/unique",
		response: test,
		alias: "getTest",
		description: "Get one test data",
	},
] as const);
