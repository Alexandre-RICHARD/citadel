import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

// Par exemple : process.env.DB_SQLITE_PATH = './database.sqlite'
export const database = new Sequelize({
  dialect: "sqlite",
  storage: process.env.DB_SQLITE_PATH ?? "./src/database.db",
  logging: false,
});

export const testDatabase = async () => {
  try {
    await database.authenticate();
  } catch (error) {
    console.error(error);
    throw new Error(
      `Erreur lors de la connexion à la base SQLite : ${JSON.stringify(error)}`,
    );
  }
};
