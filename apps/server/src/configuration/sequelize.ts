import * as mariadb from "mariadb";
import { Sequelize } from "sequelize";

import { env } from "./env.ts";

export const sequelize = new Sequelize(
	env.DB_DATABASE_NAME,
	env.DB_USER_NAME,
	env.DB_USER_PASSWORD,
	{
		dialect: env.DB_DRIVER,
		// Import statique : sinon Sequelize charge le driver par un require dynamique, absent du bundle esbuild
		dialectModule: mariadb,
		host: env.DB_HOST,
		port: env.DB_PORT,
		timezone: "+00:00",
		// eslint-disable-next-line no-console
		logging: env.LOG_DB ? console.log : false,
		define: {
			underscored: true,
			charset: "utf8mb4",
			collate: "utf8mb4_unicode_520_ci",
		},
		pool: {
			max: 10,
			idle: 30000,
			acquire: 60000,
		},
	},
);
