import type { Response as ExpressResponse } from "express";

type JsonFor<ResponseBody> = { json: (body: ResponseBody) => ExpressResponse };

type StatusReturn<Map extends object, Status extends keyof Map & number> = Omit<
	ExpressResponse,
	"json"
> &
	JsonFor<Map[Status]>;

// La réponse d'un contrôleur : chaque statut n'accepte que le corps prévu par les specs
export type TypedResponse<Map extends object> = Omit<
	ExpressResponse,
	"status" | "json"
> & {
	status<Status extends keyof Map & number>(
		code: Status,
	): StatusReturn<Map, Status>;
};
