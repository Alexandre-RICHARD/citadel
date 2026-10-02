import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
	type NonAttribute,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";
import type { Death } from "./Death.ts";
import { Game } from "./Game.ts";

export class Boss extends Model<
	InferAttributes<Boss>,
	InferCreationAttributes<Boss>
> {
	declare id: CreationOptional<number>;
	declare gameId: number;
	declare name: string;
	declare defeatedAt: CreationOptional<Date | null>;
	declare totalDeath: CreationOptional<number>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare game?: NonAttribute<Game>;
	declare deaths?: NonAttribute<Death[]>;
}

Boss.init(
	{
		id: {
			type: DataTypes.INTEGER,
			field: "id",
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		gameId: {
			type: DataTypes.INTEGER,
			field: "game_id",
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			field: "name",
			allowNull: false,
		},
		defeatedAt: {
			type: DataTypes.DATE(3),
			field: "defeated_at",
			allowNull: true,
		},
		totalDeath: {
			type: DataTypes.INTEGER,
			field: "total_death",
			allowNull: false,
			defaultValue: 0,
		},
		createdAt: {
			type: DataTypes.DATE(3),
			field: "created_at",
			allowNull: false,
		},
		updatedAt: {
			type: DataTypes.DATE(3),
			field: "updated_at",
			allowNull: false,
		},
	},
	{
		sequelize,
		tableName: "boss",
		modelName: "Boss",
		timestamps: true,
	},
);

Game.hasMany(Boss, { foreignKey: "gameId", as: "bosses" });
Boss.belongsTo(Game, { foreignKey: "gameId", as: "game" });
