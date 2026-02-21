import type { EndpointModel } from "../../../specUtils/endpointModel.type.ts";
import type { HttpMethodEnum } from "../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { AwesomeSinkDto } from "../dto/awesomeSink.dto.ts";


export interface GetResourceSink extends EndpointModel {
	request: {
		url: "/getResourceSink";
		method: HttpMethodEnum.GET;
		protected: false;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: AwesomeSinkDto[];
	};
}
