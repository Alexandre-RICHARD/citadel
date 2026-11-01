// Dépose une demande courte (bandeau, maintenance) et annonce sa fin par un toast
export type QuickRequest = (path: string, body: unknown, done: string) => void;
