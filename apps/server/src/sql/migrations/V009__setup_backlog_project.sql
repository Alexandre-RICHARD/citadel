-- Backlog : une seule base, deux groupes de tables.
-- Base globale (données IGDB) : jeux, versions, plateformes, DLC, séries, sociétés. Les id sont ceux d'IGDB,
-- sauf pour les séries (une collection et une franchise IGDB peuvent avoir le même id) et les émulateurs (id négatifs).
-- Base utilisateur : jeux du backlog, versions jouées, DLC faits. Pas encore d'utilisateurs : un seul backlog.

CREATE TABLE backlog_company (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_image_id VARCHAR(100) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

-- Série proposée par IGDB (sa collection la plus large, sinon sa franchise), ou créée à la main (les deux id IGDB à NULL).
-- La collation ignore accents et majuscules : chercher un nom de série trouve « Pokémon » en tapant « pokemon »
CREATE TABLE backlog_series (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    igdb_collection_id INT NULL,
    igdb_franchise_id INT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT uq_backlog_series_igdb_collection UNIQUE (igdb_collection_id),
    CONSTRAINT uq_backlog_series_igdb_franchise UNIQUE (igdb_franchise_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

-- Plateforme IGDB, ou émulateur (id négatif) rattaché à la console qu'il émule
CREATE TABLE backlog_platform (
    id INT PRIMARY KEY,
    short_name VARCHAR(100) NOT NULL,
    technical_name VARCHAR(100) NOT NULL,
    emulated_platform_id INT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_backlog_platform_emulated_platform
        FOREIGN KEY (emulated_platform_id) REFERENCES backlog_platform (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

-- Jeu : l'œuvre. Son id est celui de sa fiche IGDB originale, qui est aussi sa version originale
CREATE TABLE backlog_game (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    french_name VARCHAR(255) NULL,
    first_release_date DATE NULL,
    is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    proposed_series_id INT NULL,
    developer_id INT NULL,
    publisher_id INT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_backlog_game_proposed_series
        FOREIGN KEY (proposed_series_id) REFERENCES backlog_series (id),
    CONSTRAINT fk_backlog_game_developer
        FOREIGN KEY (developer_id) REFERENCES backlog_company (id),
    CONSTRAINT fk_backlog_game_publisher
        FOREIGN KEY (publisher_id) REFERENCES backlog_company (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

-- Version : toute fiche IGDB rattachée au jeu (originale, édition, remaster, portage, version enrichie).
-- title NULL : la version originale, qui affiche le nom du jeu
CREATE TABLE backlog_version (
    id INT PRIMARY KEY,
    game_id INT NOT NULL,
    title VARCHAR(255) NULL,
    cover_image_id VARCHAR(100) NULL,
    igdb_url VARCHAR(255) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_backlog_version_game
        FOREIGN KEY (game_id) REFERENCES backlog_game (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

CREATE INDEX idx_backlog_version_game_id ON backlog_version (game_id);

-- La version est sortie sur cette plateforme ; release_date : la plus ancienne date, toutes régions confondues
CREATE TABLE backlog_version_platform (
    version_id INT NOT NULL,
    platform_id INT NOT NULL,
    release_date DATE NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (version_id, platform_id),
    CONSTRAINT fk_backlog_version_platform_version
        FOREIGN KEY (version_id) REFERENCES backlog_version (id),
    CONSTRAINT fk_backlog_version_platform_platform
        FOREIGN KEY (platform_id) REFERENCES backlog_platform (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

CREATE INDEX idx_backlog_version_platform_platform_id ON backlog_version_platform (platform_id);

-- DLC ou extension, rattaché au jeu et non à une version
CREATE TABLE backlog_dlc (
    id INT PRIMARY KEY,
    game_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_backlog_dlc_game
        FOREIGN KEY (game_id) REFERENCES backlog_game (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

CREATE INDEX idx_backlog_dlc_game_id ON backlog_dlc (game_id);

-- Jeu du backlog : le jeu et sa personnalisation. created_at donne l'ordre d'ajout, celui du tableau sans tri.
-- Le numéro dans la série (3 décimales : sous-jeux) n'existe qu'avec une série ; son unicité dans la série est
-- tenue par le serveur, qui décale les numéros sous verrou
CREATE TABLE backlog_user_game (
    game_id INT PRIMARY KEY,
    image_id VARCHAR(100) NULL,
    ending_type ENUM ('story', 'runs', 'sandbox', 'multiplayer') NOT NULL,
    series_id INT NULL,
    series_number DECIMAL(7, 3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_backlog_user_game_game
        FOREIGN KEY (game_id) REFERENCES backlog_game (id),
    CONSTRAINT fk_backlog_user_game_series
        FOREIGN KEY (series_id) REFERENCES backlog_series (id),
    CONSTRAINT ck_backlog_user_game_series_number
        CHECK ((series_id IS NULL) = (series_number IS NULL) AND (series_number IS NULL OR series_number >= 1))
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

CREATE INDEX idx_backlog_user_game_series_id ON backlog_user_game (series_id);

-- Version jouée : une version sur une plateforme, unique par version + plateforme. Elle porte les données de jeu
CREATE TABLE backlog_user_version (
    id INT AUTO_INCREMENT PRIMARY KEY,
    version_id INT NOT NULL,
    platform_id INT NOT NULL,
    status ENUM (
        'notStarted', 'watched', 'started', 'wellUnderway', 'finished', 'deemedFinished',
        'completed', 'platinum', 'completedAndPlatinum', 'abandoned'
    ) NOT NULL DEFAULT 'notStarted',
    is_owned BOOLEAN NOT NULL DEFAULT FALSE,
    is_up_next BOOLEAN NOT NULL DEFAULT FALSE,
    finish_date DATE NULL,
    sure_finish_count INT NOT NULL DEFAULT 0,
    probable_finish_count INT NOT NULL DEFAULT 0,
    tracked_play_time_minutes INT NOT NULL DEFAULT 0,
    estimated_play_time_minutes INT NOT NULL DEFAULT 0,
    rating TINYINT NULL,
    comment TEXT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT uq_backlog_user_version_version_platform UNIQUE (version_id, platform_id),
    CONSTRAINT fk_backlog_user_version_version
        FOREIGN KEY (version_id) REFERENCES backlog_version (id),
    CONSTRAINT fk_backlog_user_version_platform
        FOREIGN KEY (platform_id) REFERENCES backlog_platform (id),
    CONSTRAINT ck_backlog_user_version_counts
        CHECK (sure_finish_count >= 0 AND probable_finish_count >= 0
            AND tracked_play_time_minutes >= 0 AND estimated_play_time_minutes >= 0),
    CONSTRAINT ck_backlog_user_version_rating
        CHECK (rating IS NULL OR rating BETWEEN 0 AND 20)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

CREATE INDEX idx_backlog_user_version_platform_id ON backlog_user_version (platform_id);

-- DLC fait : un DLC du jeu coché comme fait sur une version jouée ; il part avec elle
CREATE TABLE backlog_done_dlc (
    user_version_id INT NOT NULL,
    dlc_id INT NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (user_version_id, dlc_id),
    CONSTRAINT fk_backlog_done_dlc_user_version
        FOREIGN KEY (user_version_id) REFERENCES backlog_user_version (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_backlog_done_dlc_dlc
        FOREIGN KEY (dlc_id) REFERENCES backlog_dlc (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

CREATE INDEX idx_backlog_done_dlc_dlc_id ON backlog_done_dlc (dlc_id);

-- Émulateurs de départ et leurs consoles : les autres plateformes entrent en base
-- à l'enregistrement du premier jeu qui en a besoin. Ids et noms de PS2 et PS3 : ceux d'IGDB
INSERT INTO backlog_platform (id, short_name, technical_name, emulated_platform_id)
VALUES
    (8, 'PS2', 'ps2', NULL),
    (9, 'PS3', 'ps3', NULL),
    (-1, 'PCSX2', 'pcsx2', 8),
    (-2, 'RPCS3', 'rpcs3', 9);
