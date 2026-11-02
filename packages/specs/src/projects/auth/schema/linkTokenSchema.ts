import { z } from "zod";

// 32 octets en base64url, sans remplissage : le jeton du lien reçu par mail
const LINK_TOKEN = /^[A-Za-z0-9_-]{43}$/u;

export const linkTokenSchema = z
	.string({ message: "Token should be a string" })
	.regex(LINK_TOKEN, { message: "Token should be 43 base64url characters" });
