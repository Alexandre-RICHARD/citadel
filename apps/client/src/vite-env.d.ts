/// <reference types="vite/client" />

interface ViteTypeOptions {}

interface ImportMetaEnv {
	readonly VITE_LOCAL_PORT: string;
	readonly VITE_API_ADRESS: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
