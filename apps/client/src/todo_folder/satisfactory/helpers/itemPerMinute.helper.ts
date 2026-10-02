import { roundNumber } from "@citadel/common/src/universal/number/roundNumber";
type Args = {
	cycleDuration: number;
	cycleItemCount: number;
};

export const itemPerMinute = ({ cycleDuration, cycleItemCount }: Args) => {
	return roundNumber((60 / cycleDuration) * cycleItemCount, 2);
};
