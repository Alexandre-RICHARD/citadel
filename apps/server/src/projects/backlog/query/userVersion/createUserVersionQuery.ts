import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { NewUserVersionBean } from "../../bean/newUserVersionBean.type.ts";
import { DoneDlc } from "../../models/DoneDlc.ts";
import { UserVersion } from "../../models/UserVersion.ts";

// La version jouée et ses DLC faits
export async function createUserVersionQuery(
	userVersion: NewUserVersionBean,
	transaction: Transaction,
): Promise<void> {
	const { doneDlcIds, ...data } = userVersion;
	try {
		const created = await UserVersion.create(data, { transaction });
		await DoneDlc.bulkCreate(
			doneDlcIds.map((dlcId) => ({ userVersionId: created.id, dlcId })),
			{ transaction },
		);
	} catch (error) {
		throw new DatabaseError("Failed to insert played version", {
			cause: error,
		});
	}
}
