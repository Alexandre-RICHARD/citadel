import type { SagaBean } from "../bean/sagaBean.type.ts";
import { getAllSagasQuery } from "../query/saga/getAllSagasQuery.ts";

class SagaService {
	// Les sagas du compte, par nom ; aucune n'est commune (§6)
	async getAllSagas(userId: number): Promise<SagaBean[]> {
		return getAllSagasQuery(userId);
	}
}

export const sagaService = new SagaService();
