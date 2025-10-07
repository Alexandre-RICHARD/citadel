type Primitive = string | number | boolean | null | undefined;
type QueryValue = Primitive | (string | number | boolean)[];
export type QueryParams = Record<string, QueryValue>;
