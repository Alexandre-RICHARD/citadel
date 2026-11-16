-- Backlog des médias (docs/backlog/backlog_media.md) : films et séries, à côté des jeux.
-- Base commune (données TMDB) : collections, films, séries, saisons, épisodes. Les id sont ceux de TMDB : un média
-- ajouté par un compte est proposé aux autres, sans rien de personnel.
-- Base du compte : médias du backlog, épisodes vus, sagas et collections TMDB qui leur sont reliées. Aucune saga
-- n'est commune, contrairement aux séries des jeux.
-- Les séries TV s'appellent « show » dans le code et la base : « series » désigne déjà les séries des jeux.

-- ==== Base commune ====

-- Collection TMDB : elle ne sert qu'à proposer une saga (§4)
CREATE TABLE backlog_media_collection (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

-- Film. title : le titre français de TMDB, sinon l'original. Les chemins d'images sont ceux de TMDB (« /abc.jpg ») : le
-- navigateur charge l'image sur image.tmdb.org
CREATE TABLE backlog_movie (
    id INT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    original_title VARCHAR(255) NOT NULL,
    original_language VARCHAR(10) NULL,
    release_date DATE NULL,
    runtime_minutes INT NULL,
    imdb_id VARCHAR(20) NULL,
    poster_path VARCHAR(100) NULL,
    collection_id INT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_backlog_movie_collection
        FOREIGN KEY (collection_id) REFERENCES backlog_media_collection (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

CREATE INDEX idx_backlog_movie_collection_id ON backlog_movie (collection_id);

-- Série. is_ongoing : TMDB en attend encore des épisodes ; seules celles-là sont relues chaque nuit (§7.3)
CREATE TABLE backlog_tv_show (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    original_language VARCHAR(10) NULL,
    first_air_date DATE NULL,
    imdb_id VARCHAR(20) NULL,
    poster_path VARCHAR(100) NULL,
    is_ongoing BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

CREATE INDEX idx_backlog_tv_show_is_ongoing ON backlog_tv_show (is_ongoing);

-- Saison ; la saison 0 est celle des épisodes spéciaux, hors progression (§5)
CREATE TABLE backlog_tv_season (
    id INT PRIMARY KEY,
    tv_show_id INT NOT NULL,
    season_number INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    air_date DATE NULL,
    poster_path VARCHAR(100) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_backlog_tv_season_tv_show
        FOREIGN KEY (tv_show_id) REFERENCES backlog_tv_show (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

CREATE INDEX idx_backlog_tv_season_tv_show_id ON backlog_tv_season (tv_show_id);

-- Épisode. Pas d'unicité sur le numéro : TMDB renumérote parfois une saison, et l'épisode garde son id (et ses cases
-- « vu ») le temps que la relecture suivante le remette à sa place
CREATE TABLE backlog_tv_episode (
    id INT PRIMARY KEY,
    tv_season_id INT NOT NULL,
    episode_number INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    air_date DATE NULL,
    runtime_minutes INT NULL,
    still_path VARCHAR(100) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_backlog_tv_episode_tv_season
        FOREIGN KEY (tv_season_id) REFERENCES backlog_tv_season (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

CREATE INDEX idx_backlog_tv_episode_tv_season_id ON backlog_tv_episode (tv_season_id);

-- ==== Base du compte ====

-- Saga : toujours à son compte, avec le nom de son choix ; unique par compte, sans tenir compte des accents ni des
-- majuscules (collation)
CREATE TABLE backlog_saga (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT uq_backlog_saga_user_name UNIQUE (user_id, name),
    CONSTRAINT fk_backlog_saga_user
        FOREIGN KEY (user_id) REFERENCES auth_user (id)
        ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

-- Collection TMDB reliée à une saga : ajouter un film de cette collection propose la saga. Une collection n'est reliée
-- qu'à une saga par compte (clé primaire), une saga peut en réunir plusieurs
CREATE TABLE backlog_saga_collection (
    user_id INT NOT NULL,
    collection_id INT NOT NULL,
    saga_id INT NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (user_id, collection_id),
    CONSTRAINT fk_backlog_saga_collection_user
        FOREIGN KEY (user_id) REFERENCES auth_user (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_backlog_saga_collection_collection
        FOREIGN KEY (collection_id) REFERENCES backlog_media_collection (id),
    CONSTRAINT fk_backlog_saga_collection_saga
        FOREIGN KEY (saga_id) REFERENCES backlog_saga (id)
        ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

CREATE INDEX idx_backlog_saga_collection_saga_id ON backlog_saga_collection (saga_id);
CREATE INDEX idx_backlog_saga_collection_collection_id ON backlog_saga_collection (collection_id);

-- Média du backlog : un film ou une série, et ce que le compte en dit. is_watched ne sert qu'aux films : une série est
-- vue quand tous ses épisodes diffusés le sont (backlog_watched_episode). Le numéro dans la saga (3 décimales :
-- sous-parties) n'existe qu'avec une saga ; son unicité dans la saga est tenue par le serveur, qui décale les numéros
-- sous verrou, comme pour les jeux. created_at donne l'ordre d'ajout, celui du tableau sans tri
CREATE TABLE backlog_user_media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NULL,
    tv_show_id INT NULL,
    image_path VARCHAR(100) NULL,
    saga_id INT NULL,
    saga_number DECIMAL(7, 3) NULL,
    is_watched BOOLEAN NOT NULL DEFAULT FALSE,
    is_up_next BOOLEAN NOT NULL DEFAULT FALSE,
    is_in_progress BOOLEAN NOT NULL DEFAULT FALSE,
    comment TEXT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT uq_backlog_user_media_user_movie UNIQUE (user_id, movie_id),
    CONSTRAINT uq_backlog_user_media_user_tv_show UNIQUE (user_id, tv_show_id),
    CONSTRAINT fk_backlog_user_media_user
        FOREIGN KEY (user_id) REFERENCES auth_user (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_backlog_user_media_movie
        FOREIGN KEY (movie_id) REFERENCES backlog_movie (id),
    CONSTRAINT fk_backlog_user_media_tv_show
        FOREIGN KEY (tv_show_id) REFERENCES backlog_tv_show (id),
    CONSTRAINT fk_backlog_user_media_saga
        FOREIGN KEY (saga_id) REFERENCES backlog_saga (id),
    -- Exactement un film ou une série
    CONSTRAINT ck_backlog_user_media_kind
        CHECK ((movie_id IS NULL) <> (tv_show_id IS NULL)),
    CONSTRAINT ck_backlog_user_media_saga_number
        CHECK (saga_number IS NULL OR saga_id IS NOT NULL)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

CREATE INDEX idx_backlog_user_media_movie_id ON backlog_user_media (movie_id);
CREATE INDEX idx_backlog_user_media_tv_show_id ON backlog_user_media (tv_show_id);
CREATE INDEX idx_backlog_user_media_saga_id ON backlog_user_media (saga_id);

-- Épisode vu par un compte : une ligne par épisode vu, aucune pour un épisode pas vu
CREATE TABLE backlog_watched_episode (
    user_id INT NOT NULL,
    tv_episode_id INT NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (user_id, tv_episode_id),
    CONSTRAINT fk_backlog_watched_episode_user
        FOREIGN KEY (user_id) REFERENCES auth_user (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_backlog_watched_episode_tv_episode
        FOREIGN KEY (tv_episode_id) REFERENCES backlog_tv_episode (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

CREATE INDEX idx_backlog_watched_episode_tv_episode_id ON backlog_watched_episode (tv_episode_id);
