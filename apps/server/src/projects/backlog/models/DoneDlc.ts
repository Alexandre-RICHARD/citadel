import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";
import { UserVersion } from "./UserVersion.ts";

// DLC fait : un DLC du jeu coché comme fait sur une version jouée
export class DoneDlc extends Model<
	InferAttributes<DoneDlc>,
	InferCreationAttributes<DoneDlc>
> {
	declare userVersionId: number;
	declare dlcId: number;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
}

DoneDlc.init(
	{
		userVersionId: {
			type: DataTypes.INTEGER,
			field: "user_version_id",
			primaryKey: true,
			allowNull: false,
		},
		dlcId: {
			type: DataTypes.INTEGER,
			field: "dlc_id",
			primaryKey: true,
			allowNull: false,
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
		tableName: "backlog_done_dlc",
		modelName: "BacklogDoneDlc",
		timestamps: true,
	},
);

UserVersion.hasMany(DoneDlc, { foreignKey: "userVersionId", as: "doneDlcs" });
