-- Session ouverte : seulement le SHA-256 du jeton du cookie, une fuite de la base ne donne aucune session.
-- Les trois dates sont calculées par le serveur : expires_at glisse avec l'activité sans dépasser absolute_expires_at,
-- qui ne bouge pas ; la purge n'a donc que expires_at à lire.
-- ip tronquée (/24 en IPv4, /48 en IPv6) ; user_agent NULL quand le navigateur n'en envoie pas, tronqué à
-- 255 caractères par le modèle
CREATE TABLE auth_session (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash BINARY(32) NOT NULL,
    remember BOOLEAN NOT NULL,
    user_agent VARCHAR(255) NULL,
    ip VARCHAR(45) NOT NULL,
    last_seen_at DATETIME(3) NOT NULL,
    expires_at DATETIME(3) NOT NULL,
    absolute_expires_at DATETIME(3) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT uq_auth_session_token_hash UNIQUE (token_hash),
    CONSTRAINT fk_auth_session_user
        FOREIGN KEY (user_id) REFERENCES auth_user (id)
        ON DELETE CASCADE,
    CONSTRAINT ck_auth_session_expires_at
        CHECK (expires_at <= absolute_expires_at)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

CREATE INDEX idx_auth_session_user_id ON auth_session (user_id);
-- La purge des sessions expirées, toutes les 15 minutes
CREATE INDEX idx_auth_session_expires_at ON auth_session (expires_at);
