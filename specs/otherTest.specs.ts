import { makeApi } from "@zodios/core";
import z from "zod";

const otherTest = z.object({
	id: z.number(),
	name: z.string(),
	isActive: z.boolean(),
});

const defaultErrors = z.object({
	code: z.number(),
	message: z.string(),
});

export const otherTestSpecs = makeApi([
	{
		method: "get",
		path: "/test-other/all",
		response: z.array(otherTest),
		status: 200,
		alias: "getOtherTests",
		description: "Get all other test datas",
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
		path: "/test-other/unique",
		response: otherTest,
		status: 200,
		alias: "getOtherTest",
		description: "Get one other test data",
		errors: [
			{
				status: 500,
				description: "Servor error",
				schema: defaultErrors,
			},
		],
	},
] as const);
