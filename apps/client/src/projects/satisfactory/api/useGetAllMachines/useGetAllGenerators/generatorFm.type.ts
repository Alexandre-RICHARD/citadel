import type { GameClassNamesEnum } from "../../../enums/gameClassNames.enum";
import type { Location } from "../../../type/location.type";

export type GeneratorFm = {
	id: string;
	name: string;
	className: GameClassNamesEnum;
	overclocking: number;
	isAtFullSpeed: boolean;
	powerProduction: number;
	location: Location;
};
