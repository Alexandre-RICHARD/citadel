import { assertBoolean } from "@citadel/common/src/universal/asserts/assertBoolean.ts";
import { assertNumber } from "@citadel/common/src/universal/asserts/assertNumber.ts";
import { assertString } from "@citadel/common/src/universal/asserts/assertString.ts";
import type { CreateTest } from "@citadel/specs/src/projects/test/endpoint/createTestEndpoint.interface.ts";
import type { DeleteTest } from "@citadel/specs/src/projects/test/endpoint/deleteTestEndpoint.interface.ts";
import type { GetAllTest } from "@citadel/specs/src/projects/test/endpoint/getAllTestEndpoint.interface.ts";
import type { GetOneTest } from "@citadel/specs/src/projects/test/endpoint/getOneTestEndpoint.interface.ts";
import type { UpdateTest } from "@citadel/specs/src/projects/test/endpoint/updateTestEndpoint.interface.ts";
import { TestErrorCodeEnum } from "@citadel/specs/src/projects/test/error/testErrorCode.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { BadRequestError } from "../../../error/BadRequestError.ts";
import { NotFoundError } from "../../../error/NotFoundError.ts";
import { toTestDtoMapper } from "../dto/toTestDtoMapper.ts";
import { toTestsDtoMapper } from "../dto/toTestsDtoMapper.ts";
import { createTest } from "../query/createTest.ts";
import { deleteTest } from "../query/deleteTest.ts";
import { getAllTest } from "../query/getAllTest.ts";
import { getOneTest } from "../query/getOneTest.ts";
import { updateTest } from "../query/updateTest.ts";

export const testController = {
	getOne: asyncRequestHandler<GetOneTest>(async (request, response) => {
		const { id } = request.params;
		const parsedId = Number(id);
		assertNumber(parsedId, "testController::getOne> id");

		const result = await getOneTest({ id: parsedId });

		if (!result) {
			throw new NotFoundError(
				TestErrorCodeEnum.TEST_NOT_FOUND,
				`No test with id : ${parsedId}`,
			);
		}

		return response
			.status(HttpStatutCodeSuccessEnum.SUCCESS)
			.json(toTestDtoMapper(result));
	}),

	getAll: asyncRequestHandler<GetAllTest>(async (_r, response) => {
		const result = await getAllTest();

		if (!result) {
			return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).json([]);
		}

		return response
			.status(HttpStatutCodeSuccessEnum.SUCCESS)
			.json(toTestsDtoMapper(result));
	}),

	create: asyncRequestHandler<CreateTest>(async (request, response) => {
		const { name } = request.body;
		assertString(name, "testController::create> name");

		const result = await createTest({ name });

		if (!result) {
			throw new BadRequestError("Test could not be created");
		}

		return response
			.status(HttpStatutCodeSuccessEnum.CREATED)
			.json(toTestDtoMapper(result));
	}),

	update: asyncRequestHandler<UpdateTest>(async (request, response) => {
		const { id } = request.params;
		const parsedId = Number(id);
		const { name, isActive } = request.body;
		assertString(name, "testController::getOne> name");
		assertNumber(parsedId, "testController::getOne> id");
		assertBoolean(isActive, "testController::getOne> isActive");

		const result = await updateTest({
			id: parsedId,
			name,
			isActive,
		});

		if (!result) {
			throw new NotFoundError(
				TestErrorCodeEnum.TEST_NOT_FOUND,
				`No test with id : ${parsedId}`,
			);
		}

		return response
			.status(HttpStatutCodeSuccessEnum.SUCCESS)
			.json(toTestDtoMapper(result));
	}),

	delete: asyncRequestHandler<DeleteTest>(async (request, response) => {
		const { id } = request.params;
		const parsedId = Number(id);
		assertNumber(parsedId, "testController::getOne> id");

		await deleteTest({ id: parsedId });
		return response.status(HttpStatutCodeSuccessEnum.SUCCESS).json(null);
	}),
};
