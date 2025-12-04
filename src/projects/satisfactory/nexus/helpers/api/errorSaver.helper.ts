import { FetchMethodsEnum } from "../../enums/fetchMethods.enum";
import { fetcherHelper } from "./fetcher.helper";

type Args = {
	errorApiUrl: string;
	projectName: string;
	context: string;
	errorMessage: string;
};

export const errorSaver = async ({
	errorApiUrl,
	projectName,
	context,
	errorMessage,
}: Args): Promise<void> => {
	await fetcherHelper({
		apiUrl: errorApiUrl,
		endPoint: "/error",
		method: FetchMethodsEnum.POST,
		body: {
			projectName,
			context,
			errorMessage,
		},
	});
};
