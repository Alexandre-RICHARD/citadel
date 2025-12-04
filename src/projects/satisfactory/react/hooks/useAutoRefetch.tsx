import {
  fetcherHelper,
  FetchMethodsEnum,
  type FetchResponse,
  useLocalStorage,
} from "@nexus/nexusExporter";
import { useEffect, useState } from "react";

import { defaultFrmSettingsData } from "../../dictionnaries/defaultFrmSettingsData";
import { endPointDictionnary } from "../../dictionnaries/endPoint.dictionary";
import type { EndpointEnum } from "../../enums/endpoint.enum";
import type { MapperFunction } from "../../types/satisfactory/endpoint.type";
import type { FrmSettingsData } from "../../types/satisfactory/frmSettingsData.type";

// eslint-disable-next-line import/no-unused-modules
export const useAutoRefetch = <Dto, Fm>(
  endPoint?: EndpointEnum,
  skip?: boolean,
): FetchResponse<Fm> => {
  const mapper = endPoint
    ? (endPointDictionnary[endPoint] as MapperFunction<Dto, Fm>)
    : undefined;
  const { value: settings } = useLocalStorage<FrmSettingsData>(
    "rmd_settings",
    defaultFrmSettingsData,
  );

  const [responseState, setResponseState] = useState<FetchResponse<Fm>>({
    status: "",
    success: false,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isMounted && !skip && mapper) {
        const response = await fetcherHelper<Dto>({
          apiUrl: `http://${settings.ip}:${settings.port}`,
          endPoint: `/${endPoint}`,
          method: FetchMethodsEnum.GET,
        });
        setResponseState({
          ...response,
          data: response.data && mapper(response.data),
        });
      }
    };

    const refetchLoop = () => {
      fetchData().catch((error) => console.error(error));
      setTimeout(refetchLoop, settings.interval);
    };

    refetchLoop();

    return () => {
      isMounted = false;
    };
  }, [endPoint, mapper, settings, skip]);

  return responseState;
};
