import type { AwesomeSinkDto } from "@specs/project/satisfactory/dto/awesomeSink.dto";

import type { AwesomeSinkFm } from "./awesomeSinkFm.type";

export function awesomeSinkDtoToFmMapper(
	explorationSinkDto: AwesomeSinkDto[] | undefined,
	resourceSinkDto: AwesomeSinkDto[] | undefined,
): AwesomeSinkFm {
	const explorationPart = explorationSinkDto?.[0]
		? {
				progressionPurcent: explorationSinkDto[0].Percent,
				remainingPointsToNextCoupon: explorationSinkDto[0].PointsToCoupon,
				totalPoints: explorationSinkDto[0].TotalPoints,
				graphValues: explorationSinkDto[0].GraphPoints ?? [],
			}
		: undefined;

	const resourcePart = resourceSinkDto?.[0]
		? {
				progressionPurcent: resourceSinkDto[0].Percent,
				remainingPointsToNextCoupon: resourceSinkDto[0].PointsToCoupon,
				totalPoints: resourceSinkDto[0].TotalPoints,
				graphValues: resourceSinkDto[0].GraphPoints ?? [],
			}
		: undefined;

	return {
		availableCoupons: explorationSinkDto?.[0].NumCoupon ?? 0,
		Exploration: explorationPart,
		Resource: resourcePart,
	};
}
