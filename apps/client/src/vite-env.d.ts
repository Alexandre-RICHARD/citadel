/// <reference types="vite/client" />

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ViteTypeOptions {}

interface ImportMetaEnv {
	readonly VITE_LOCAL_PORT: string;
	readonly VITE_API_ADRESS: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
