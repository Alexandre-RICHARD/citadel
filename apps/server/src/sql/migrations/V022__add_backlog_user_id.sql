-- Chaque backlog appartient à un compte. Les données IGDB (jeux, versions, plateformes, DLC, sociétés, séries proposées)
-- restent communes à tous ; seuls les jeux du backlog, les versions jouées et les séries créées à la main ont un
-- propriétaire. La prod n'a aucune donnée à garder (cahier de l'authentification, §1.2) : les lignes des utilisateurs
-- partent, et user_id est obligatoire dès maintenant

-- Les DLC faits partent avec leur version jouée (ON DELETE CASCADE, V009)
DELETE FROM backlog_user_version;
DELETE FROM backlog_user_game;
-- Les séries créées à la main n'ont plus aucun jeu ; une série proposée par IGDB a toujours un id IGDB
DELETE FROM backlog_series
WHERE igdb_collection_id IS NULL AND igdb_franchise_id IS NULL;

-- ==== Jeux du backlog : un par compte et par jeu ====
ALTER TABLE backlog_user_game
    ADD COLUMN user_id INT NOT NULL FIRST;

-- La clé primaire (game_id) servait d'index à la clé étrangère vers le jeu : un index la remplace avant qu'elle change
CREATE INDEX idx_backlog_user_game_game_id ON backlog_user_game (game_id);

ALTER TABLE backlog_user_game
    DROP PRIMARY KEY,
    ADD PRIMARY KEY (user_id, game_id);

ALTER TABLE backlog_user_game
    ADD CONSTRAINT fk_backlog_user_game_user
        FOREIGN KEY (user_id) REFERENCES auth_user (id)
        ON DELETE CASCADE;

-- ==== Versions jouées : uniques par compte, version et plateforme ====
ALTER TABLE backlog_user_version
    ADD COLUMN user_id INT NOT NULL AFTER id;

-- L'unicité (version_id, platform_id) servait d'index à la clé étrangère vers la version : idem
CREATE INDEX idx_backlog_user_version_version_id ON backlog_user_version (version_id);

ALTER TABLE backlog_user_version
    DROP INDEX uq_backlog_user_version_version_platform,
    ADD CONSTRAINT uq_backlog_user_version_user_version_platform
        UNIQUE (user_id, version_id, platform_id);

ALTER TABLE backlog_user_version
    ADD CONSTRAINT fk_backlog_user_version_user
        FOREIGN KEY (user_id) REFERENCES auth_user (id)
        ON DELETE CASCADE;

-- ==== Séries : une série IGDB est à tous, une série créée à la main à son seul compte ====
ALTER TABLE backlog_series
    ADD COLUMN user_id INT NULL AFTER id;

ALTER TABLE backlog_series
    ADD CONSTRAINT fk_backlog_series_user
        FOREIGN KEY (user_id) REFERENCES auth_user (id)
        ON DELETE CASCADE,
    ADD CONSTRAINT ck_backlog_series_owner
        CHECK ((user_id IS NULL) = (igdb_collection_id IS NOT NULL OR igdb_franchise_id IS NOT NULL));
