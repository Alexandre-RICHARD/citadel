/**
 * Format auto-descriptif d'un hash stocké, `argon2id:m=19456,t=2,p=1:<sel>:<empreinte>`, sel et empreinte en base64url.
 * Les paramètres voyagent avec le hash : s'ils montent, les anciens hashs restent vérifiables. Ni « $ » (Compose y verrait
 * une variable dans .env.prod) ni « : » dans les morceaux
 */
export const PASSWORD_HASH_ALGORITHM = "argon2id";
