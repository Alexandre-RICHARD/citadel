import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { AuthEventTypeEnum } from "../../enum/authEventType.enum.ts";
import { AuthEvent } from "../../models/AuthEvent.ts";

type AuthEventRow = {
	type: AuthEventTypeEnum;
	userId: number | null;
	ip: string;
	userAgent: string | null;
};

export async function createAuthEventQuery(row: AuthEventRow): Promise<void> {
	try {
		await AuthEvent.create(row);
	} catch (error) {
		throw new DatabaseError("Failed to insert auth event", { cause: error });
	}
}
