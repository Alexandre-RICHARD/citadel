import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
	type NonAttribute,
} from "sequelize";

import { sequelize } from "../../../sequelize.ts";
import { Boss } from "./Boss.ts";

export class Death extends Model<
	InferAttributes<Death>,
	InferCreationAttributes<Death>
> {
	declare id: CreationOptional<number>;
	declare bossId: number;
	declare date: Date;
	declare comment: CreationOptional<string | null>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;

	declare boss?: NonAttribute<Boss>;
}

Death.init(
	{
		id: {
			type: DataTypes.INTEGER,
			field: "id",
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		bossId: {
			type: DataTypes.INTEGER,
			field: "boss_id",
			allowNull: false,
		},
		date: {
			type: DataTypes.DATE(3),
			field: "date",
			allowNull: false,
		},
		comment: {
			type: DataTypes.STRING(1000),
			field: "comment",
			allowNull: true,
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
		tableName: "death",
		modelName: "Death",
		timestamps: true,
	},
);

Boss.hasMany(Death, { foreignKey: "bossId", as: "deaths" });
Death.belongsTo(Boss, { foreignKey: "bossId", as: "boss" });
