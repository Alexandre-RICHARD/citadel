export class ApiError<Body = unknown> extends Error {
	constructor(
		public readonly status: number,
		public readonly body: Body,
	) {
		super(`HTTP ${status}`);
		this.name = "ApiError";
	}
}
