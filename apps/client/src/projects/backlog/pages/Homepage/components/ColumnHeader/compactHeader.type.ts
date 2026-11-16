import type { LucideIcon } from "lucide-react";

/**
 * En-tête compact, pour un tableau moins large : une icône ou un mot à la place d'un libellé bien plus large que les
 * valeurs. Le libellé complet reste dans l'info-bulle et pour les lecteurs d'écran ; vide : ni icône ni mot (Actions)
 */
export type CompactHeader = { icon?: LucideIcon; text?: string };
