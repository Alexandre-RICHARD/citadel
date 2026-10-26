import type { CompanyBean } from "../../bean/companyBean.type.ts";
import type { IgdbCompany } from "../../igdb/type/igdbCompany.type.ts";

export function fromIgdbCompanyToCompanyBean(
	company: IgdbCompany,
): CompanyBean {
	return {
		id: company.id,
		name: company.name,
		logoImageId: company.logo?.image_id ?? null,
	};
}
