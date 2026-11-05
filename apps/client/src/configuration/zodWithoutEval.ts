import { z } from "zod";

// zod sonde `new Function` au premier parse pour compiler ses validateurs : la Content-Security-Policy du site
// (infra/Caddyfile) l'interdit, l'erreur est avalée, mais le navigateur la signale sur chaque page
// (securitypolicyviolation). Sans la sonde, zod valide directement, sans rien compiler
z.config({ jitless: true });
