// Contrôles (retour à la ligne, tabulation…), caractères de mise en forme et caractères ignorables (espace sans chasse
// U+200B, joints, sélecteurs de variante…) : invisibles à l'écran, ils font passer un texte pour un autre
const INVISIBLE_CHARACTER =
	/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}\p{Default_Ignorable_Code_Point}]/u;

// Les seuls invisibles légitimes : ceux qui composent un émoji (❤️ avec son sélecteur, 👨‍👩‍👧 avec ses joints), collés à lui
const EMOJI_SEQUENCE_JOINER =
	/(?<=\p{Extended_Pictographic}\p{Emoji_Modifier}?)️|(?<=\p{Extended_Pictographic}\p{Emoji_Modifier}?️?)‍(?=\p{Extended_Pictographic})/gu;

export function hasInvisibleCharacter(text: string): boolean {
	return INVISIBLE_CHARACTER.test(text.replace(EMOJI_SEQUENCE_JOINER, ""));
}
