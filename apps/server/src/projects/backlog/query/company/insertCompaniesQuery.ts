import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { CompanyBean } from "../../bean/companyBean.type.ts";
import { Company } from "../../models/Company.ts";

// Les sociétés qui manquent ; une société déjà en base garde son nom et son logo (synchronisation : pour plus tard)
export async function insertCompaniesQuery(
	companies: CompanyBean[],
	transaction: Transaction,
): Promise<void> {
	const uniqueCompanies = [
		...new Map(companies.map((company) => [company.id, company])).values(),
	];
	if (uniqueCompanies.length === 0) return;

	try {
		await Company.bulkCreate(
			uniqueCompanies.map((company) => ({
				id: company.id,
				name: company.name,
				logoImageId: company.logoImageId,
			})),
			{ ignoreDuplicates: true, transaction },
		);
	} catch (error) {
		throw new DatabaseError("Failed to insert companies", { cause: error });
	}
}
