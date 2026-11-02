-- Parcours en plusieurs étapes (inscription, connexion avec second facteur, connexion par mail, mot de passe oublié,
-- changement d'email, activation du facteur mail), lié au navigateur par son cookie : seulement le SHA-256 du jeton.
-- user_id NULL pour une inscription seulement : le compte n'existe pas encore, ses données attendent dans payload.
-- email : même collation que auth_user.email, une nouvelle inscription à la même adresse remplace celle en attente.
-- code_hmac et link_token_hash NULL : aucun mail envoyé à cette étape (second facteur, nouveau mot de passe)
CREATE TABLE auth_flow (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token_hash BINARY(32) NOT NULL,
    kind ENUM ('registration', 'login', 'mail_login', 'password_reset', 'email_change', 'email_factor') NOT NULL,
    step ENUM ('mail_code', 'second_factor', 'new_password') NOT NULL,
    user_id INT NULL,
    email VARCHAR(254) NOT NULL COLLATE utf8mb4_uca1400_as_ci,
    payload JSON NULL,
    code_hmac BINARY(32) NULL,
    link_token_hash BINARY(32) NULL,
    attempts INT NOT NULL DEFAULT 0,
    send_count INT NOT NULL DEFAULT 0,
    remember BOOLEAN NOT NULL DEFAULT FALSE,
    last_sent_at DATETIME(3) NULL,
    expires_at DATETIME(3) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT uq_auth_flow_token_hash UNIQUE (token_hash),
    CONSTRAINT fk_auth_flow_user
        FOREIGN KEY (user_id) REFERENCES auth_user (id)
        ON DELETE CASCADE,
    CONSTRAINT ck_auth_flow_user_id
        CHECK ((kind = 'registration') = (user_id IS NULL)),
    -- Les étapes par où passe chaque parcours : le second facteur vient après le mot de passe ou le mail, le nouveau
    -- mot de passe après le mail et l'éventuel second facteur
    CONSTRAINT ck_auth_flow_step
        CHECK (
            (kind IN ('registration', 'email_change', 'email_factor') AND step = 'mail_code')
            OR (kind = 'login' AND step = 'second_factor')
            OR (kind = 'mail_login' AND step IN ('mail_code', 'second_factor'))
            OR kind = 'password_reset'
        ),
    CONSTRAINT ck_auth_flow_counts
        CHECK (attempts >= 0 AND send_count >= 0)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

CREATE INDEX idx_auth_flow_user_id ON auth_flow (user_id);
CREATE INDEX idx_auth_flow_email ON auth_flow (email);
-- La purge des parcours expirés, toutes les 15 minutes
CREATE INDEX idx_auth_flow_expires_at ON auth_flow (expires_at);
