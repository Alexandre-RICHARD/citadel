import { z } from "zod";

import { UserDataProjectEnum } from "../../../enum/userDataProject.enum.ts";

export const deleteProjectDataPathParamSchema = z.object({
	project: z.enum(UserDataProjectEnum, { message: "Project is not valid" }),
});
