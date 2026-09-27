export type TestDto = {
	id: number;
	name: string;
	isActive: boolean;
	createdAt: Date; // TODO Doit devenir une string
	updatedAt: Date | null;
};
