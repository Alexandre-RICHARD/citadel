import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { SagaBean } from "../../bean/sagaBean.type.ts";
import { Saga } from "../../models/Saga.ts";

// Les sagas du compte, par nom
export async function getAllSagasQuery(userId: number): Promise<SagaBean[]> {
	try {
		const sagas = await Saga.findAll({
			attributes: ["id", "name"],
			where: { userId },
			order: [
				["name", "ASC"],
				["id", "ASC"],
			],
		});
		return sagas.map(({ id, name }) => ({ id, name }));
	} catch (error) {
		throw new DatabaseError("Failed to fetch sagas", { cause: error });
	}
}
