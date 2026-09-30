import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";

export class Test extends Model<
	InferAttributes<Test>,
	InferCreationAttributes<Test>
> {
	declare id: CreationOptional<number>;
	declare name: string;
	declare isActive: CreationOptional<boolean>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
}

Test.init(
	{
		id: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
			unique: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		isActive: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		createdAt: {
			type: DataTypes.DATE(3),
			allowNull: false,
		},
		updatedAt: {
			type: DataTypes.DATE(3),
			allowNull: true,
		},
	},
	{
		sequelize,
		tableName: "tests",
		modelName: "Test",
		timestamps: false,
	},
);
