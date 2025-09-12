import { makeApi } from "@zodios/core";
import z from "zod";

const test = z.object({
	id: z.number(),
	name: z.string(),
	isActive: z.boolean(),
});

const defaultErrors = z.object({
	code: z.number(),
	message: z.string(),
});

export const testSpecs = makeApi([
	{
		method: "get",
		path: "/test/all",
		response: z.array(test),
		status: 200,
		alias: "getTests",
		description: "Get all test datas",
		errors: [
			{
				status: 500,
				description: "Servor error",
				schema: defaultErrors,
			},
		],
	},
	{
		method: "get",
		path: "/test/unique",
		response: test,
		status: 200,
		alias: "getTest",
		description: "Get one test data",
		errors: [
			{
				status: 500,
				description: "Servor error",
				schema: defaultErrors,
			},
		],
	},
] as const);
