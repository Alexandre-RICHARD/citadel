export enum HttpStatutCodeErrorEnum {
	TEMPORARY_REDIRECT = 307, // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/307
	PERMANENTLY_REDIRECT = 308, // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/308
	BAD_REQUEST = 400, // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/400
	NEED_AUTHENTIFICATION = 401, // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/401
	FORBIDDEN = 403, // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/403
	NOT_FOUND = 404, // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/404
	METHOD_NOT_ALLOWED = 405, // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/405
	CONFLICT_WITH_SERVER = 409, // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/409
	DELETE_ON_SERVER = 410, // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/410
	OUT_OF_RANGE = 416, // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/416
	SERVER_ERROR = 500, // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/500
}
