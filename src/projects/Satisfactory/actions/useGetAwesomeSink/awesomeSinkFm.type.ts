import type { AwesomeSinkTypeEnum } from "./awesomeSinkType.enum";

type AbstractAwesomeSinkInfo = {
	totalPoints: number;
	remainingPointsToNextCoupon: number;
	progressionPurcent: number;
	graphValues: number[];
};

export type AwesomeSinkFm = {
	availableCoupons: number;
	[AwesomeSinkTypeEnum.Exploration]: AbstractAwesomeSinkInfo | undefined;
	[AwesomeSinkTypeEnum.Resource]: AbstractAwesomeSinkInfo | undefined;
};
