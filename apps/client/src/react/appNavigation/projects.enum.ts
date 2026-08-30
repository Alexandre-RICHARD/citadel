export const ProjectsEnum = {
	GameDeathCount: "gameDeathCounter",
	Homepage: "homepage",
	Satisfactory: "satisfactory",
	Test: "test",
} as const;

export type ProjectsEnumType = (typeof ProjectsEnum)[keyof typeof ProjectsEnum];
