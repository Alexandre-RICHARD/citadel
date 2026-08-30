import { roundNumber } from "../nexus/helpers/data/number/roundNumber.helper";

type Args = {
	cycleDuration: number;
	cycleItemCount: number;
};

export const itemPerMinute = ({ cycleDuration, cycleItemCount }: Args) => {
	return roundNumber((60 / cycleDuration) * cycleItemCount, 2);
};
