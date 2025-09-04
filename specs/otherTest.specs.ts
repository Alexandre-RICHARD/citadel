import { makeApi } from "@zodios/core";
import z from "zod";

const otherTest = z.object({
	id: z.number(),
	name: z.string(),
	isActive: z.boolean(),
});

export const otherTestSpecs = makeApi([
	{
		method: "get",
		path: "/test-other/all",
		response: z.array(otherTest),
		alias: "getOtherTests",
		description: "Get all other test datas",
	},
	{
		method: "get",
		path: "/test-other/unique",
		response: otherTest,
		alias: "getOtherTest",
		description: "Get one other test data",
	},
] as const);
