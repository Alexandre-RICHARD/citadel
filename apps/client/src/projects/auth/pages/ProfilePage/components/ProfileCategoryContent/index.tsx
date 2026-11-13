import type { MeFm } from "../../../../api/model/meFm.type";
import { ProfileCategoryEnum } from "../../../../routing/profileCategory.enum";
import { DataSection } from "../DataSection";
import { IdentitySection } from "../IdentitySection";
import { LoginMethodsSection } from "../LoginMethodsSection";
import { PasswordSection } from "../PasswordSection";
import { PreferencesSection } from "../PreferencesSection";
import { SecondFactorSection } from "../SecondFactorSection";
import { SessionsSection } from "../SessionsSection";

type Props = {
	category: ProfileCategoryEnum;
	me: MeFm;
};

// Ce que chaque catégorie réunit
export function ProfileCategoryContent({ category, me }: Props) {
	switch (category) {
		case ProfileCategoryEnum.IDENTITY:
			return <IdentitySection me={me} />;
		case ProfileCategoryEnum.LOGIN:
			return (
				<>
					<LoginMethodsSection me={me} />
					<SessionsSection />
				</>
			);
		case ProfileCategoryEnum.SECURITY:
			return (
				<>
					<PasswordSection />
					<SecondFactorSection />
				</>
			);
		case ProfileCategoryEnum.DATA:
			return <DataSection />;
		case ProfileCategoryEnum.PREFERENCES:
			return <PreferencesSection />;
	}
}
