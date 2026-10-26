import type { CompanyFm } from "../../../../api/model/companyFm.type";
import styles from "../../../../backlog.module.scss";
import { getIgdbImageUrl } from "../../../../helper/image/getIgdbImageUrl";
import { IgdbImageSizeEnum } from "../../../../helper/image/igdbImageSize.enum";

// Société : logo au-dessus du nom, posé sur une plaque claire en thème sombre
export function CompanyLabel({ company }: { company: CompanyFm | null }) {
	if (company === null) return <span className={styles.emptyValue}>—</span>;
	return (
		<span className={styles.company}>
			{company.logoImageId !== null && (
				<span className={styles.companyLogo}>
					<img
						src={getIgdbImageUrl(
							company.logoImageId,
							IgdbImageSizeEnum.LOGO_MED,
						)}
						alt=""
						loading="lazy"
					/>
				</span>
			)}
			<span className={styles.companyName}>{company.name}</span>
		</span>
	);
}
