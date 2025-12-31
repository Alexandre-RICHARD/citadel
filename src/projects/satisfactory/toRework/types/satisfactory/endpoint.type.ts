import type { EndpointEnum } from "../../enums/endpoint.enum";

export type MapperFunction<Input, Output> = (data: Input) => Output;

// TODO, gérer ça mieux
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type EndPoint = Record<EndpointEnum, MapperFunction>;
