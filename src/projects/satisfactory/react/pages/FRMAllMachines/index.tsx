import { roundNumber } from "@nexus/nexusExporter";
import React, { useMemo, useState } from "react";

import { EndpointEnum } from "../../../enums/endpoint.enum";
import type { ExtractorDto } from "../../../types/satisfactory/apis/dataTransferObject/extractorDto.type";
import type { FactoryDto } from "../../../types/satisfactory/apis/dataTransferObject/factoryDto.type";
import type { GeneratorDto } from "../../../types/satisfactory/apis/dataTransferObject/generatorsDto.type";
import type { ExtractorFm } from "../../../types/satisfactory/apis/frontModel/extractorFm.type";
import type { FactoryFm } from "../../../types/satisfactory/apis/frontModel/factoryFm.type";
import type { GeneratorFm } from "../../../types/satisfactory/apis/frontModel/generatorsFm.type";
import { useAutoRefetch } from "../../hooks/useAutoRefetch";

export const FRMAllMachines = (): React.JSX.Element => {
  const [onlyNonFullEfficent, setOnlyNonFullEfficent] = useState(false);

  const { data: extractors } = useAutoRefetch<ExtractorDto[], ExtractorFm[]>(
    EndpointEnum.EXTRACTOR,
  );
  const { data: factories } = useAutoRefetch<FactoryDto[], FactoryFm[]>(
    EndpointEnum.FACTORY,
  );
  const { data: generators } = useAutoRefetch<GeneratorDto[], GeneratorFm[]>(
    EndpointEnum.GENERATOR,
  );

  const allData = useMemo(
    () => [...(extractors ?? []), ...(factories ?? []), ...(generators ?? [])],
    [extractors, factories, generators],
  );

  const filteredData = useMemo(() => {
    return allData.filter((oneMachine) => {
      const efficientFilter = (): boolean => {
        if (!onlyNonFullEfficent) return true;
        if ("powerConsumption" in oneMachine)
          return oneMachine.efficiency !== 100;
        if ("powerProduction" in oneMachine) return !oneMachine.isAtFullSpeed;
        return false;
      };
      return !!efficientFilter();
    });
  }, [allData, onlyNonFullEfficent]);

  return (
    <div>
      <div className="flex p-4">
        <label
          className="flex gap-4"
          htmlFor="onlyNonFullEfficentCheckbox"
        >
          Uniquement les non efficient
          <input
            checked={onlyNonFullEfficent}
            id="onlyNonFullEfficentCheckbox"
            className="text-gray-50"
            type="checkbox"
            onClick={() => setOnlyNonFullEfficent((prev) => !prev)}
          />
        </label>
      </div>
      <table className="w-full border border-cyan-50">
        <thead className="sticky top-0 bg-black border border-cyan-50">
          <tr>
            <th>Name</th>
            <th>Overclocking</th>
            <th>Efficiency</th>
            <th>Power Consumption</th>
            <th>Power Production</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody className="overflow-y-auto">
          {filteredData.map((oneMachine) => {
            if ("powerConsumption" in oneMachine) {
              return (
                <tr key={oneMachine.id}>
                  <td className="text-center">{oneMachine.name}</td>
                  <td className="text-center">
                    {roundNumber(oneMachine.overclocking, 2)} %
                  </td>
                  <td className="text-center">
                    {roundNumber(oneMachine.efficiency, 2)} %
                  </td>
                  <td className="text-center">
                    {roundNumber(oneMachine.powerConsumption, 2)} Mw
                  </td>
                  <td className="text-center">N/A</td>
                  <td className="text-center">{`${roundNumber(oneMachine.location.x / 100, 2)}, ${roundNumber(oneMachine.location.y / 100, 2)}`}</td>
                </tr>
              );
            }

            if ("powerProduction" in oneMachine) {
              return (
                <tr key={oneMachine.id}>
                  <td className="text-center">{oneMachine.name}</td>
                  <td className="text-center">
                    {roundNumber(oneMachine.overclocking, 2)} %
                  </td>
                  <td className="text-center">
                    {oneMachine.isAtFullSpeed ? "100 %" : "0 %"}
                  </td>
                  <td className="text-center">N/A</td>
                  <td className="text-center">
                    {roundNumber(oneMachine.powerProduction, 2)} Mw
                  </td>
                  <td className="text-center">{`${roundNumber(oneMachine.location.x / 100, 2)}, ${roundNumber(oneMachine.location.y / 100, 2)}`}</td>
                </tr>
              );
            }
            return null;
          })}
        </tbody>
      </table>
    </div>
  );
};
