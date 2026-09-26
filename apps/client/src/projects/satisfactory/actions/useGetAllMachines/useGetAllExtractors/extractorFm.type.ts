import type { GameClassNamesEnum } from "../../../enums/gameClassNames.enum";
import type { Location } from "../../../type/location.type";

export type ExtractorFm = {
	id: string;
	name: string;
	className: GameClassNamesEnum;
	overclocking: number;
	efficiency: number;
	powerConsumption: number;
	location: Location;
};
