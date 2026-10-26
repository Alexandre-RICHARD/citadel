import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";

// Série proposée par IGDB (collection ou franchise), ou créée à la main : les deux id IGDB à null
export class Series extends Model<
	InferAttributes<Series>,
	InferCreationAttributes<Series>
> {
	declare id: CreationOptional<number>;
	declare name: string;
	declare igdbCollectionId: number | null;
	declare igdbFranchiseId: number | null;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
}

Series.init(
	{
		id: {
			type: DataTypes.INTEGER,
			field: "id",
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			field: "name",
			allowNull: false,
		},
		igdbCollectionId: {
			type: DataTypes.INTEGER,
			field: "igdb_collection_id",
			allowNull: true,
		},
		igdbFranchiseId: {
			type: DataTypes.INTEGER,
			field: "igdb_franchise_id",
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
		tableName: "backlog_series",
		modelName: "BacklogSeries",
		timestamps: true,
	},
);
