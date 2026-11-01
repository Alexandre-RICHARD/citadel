import { useLocalStorage } from "@citadel/common/src/react/hooks/useLocalStorage";
import { getTodayIsoDate } from "@citadel/common/src/universal/date/getTodayIsoDate";
import { CONTACT_EMAIL } from "@citadel/specs/src/projects/contact/contactEmail";

import { useIsContactOpen } from "../../../common/api/mail/useIsContactOpen";
import { BannerItem } from "../BannerItem";
import { readDismissedId } from "../readDismissedId";

const DISMISSED_KEY = "citadel:banner:mail:dismissed";

// Le quota quotidien de mails a fermé le formulaire de contact. Fermé, il ne revient pas de la journée
export function MailQuotaBanner() {
	const isContactOpen = useIsContactOpen();
	const [dismissedId, setDismissedId] = useLocalStorage<string | null>(
		DISMISSED_KEY,
		readDismissedId,
	);
	const bannerId = `contact-closed:${getTodayIsoDate()}`;

	if (isContactOpen || dismissedId === bannerId) return null;

	return (
		<BannerItem
			emoji="✉️"
			message={`Le formulaire de contact est fermé pour aujourd'hui, il rouvre demain. Vous pouvez toujours écrire à ${CONTACT_EMAIL}.`}
			onClose={() => setDismissedId(bannerId)}
		/>
	);
}
