import type { CompanyBean } from "../../bean/companyBean.type.ts";
import type { Company } from "../../models/Company.ts";

export function fromCompanyEntityToCompanyBean(
	company: Company | null,
): CompanyBean | null {
	return company === null
		? null
		: { id: company.id, name: company.name, logoImageId: company.logoImageId };
}
