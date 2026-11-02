-- Second facteur d'un compte, nommé par l'utilisateur, qui peut en avoir plusieurs.
-- totp : secret chiffré en AES-256-GCM (version de la clé et id du facteur en donnée associée : le secret s'écrit donc
-- après l'insertion, d'où un secret NULL toléré) ; last_used_step, le pas de 30 s du dernier code accepté (anti-rejeu),
-- tient en INT jusqu'à l'an 4000 (un BIGINT arriverait en chaîne).
-- email : ni secret ni pas, le code part par mail
-- confirmed_at NULL : le facteur n'est pas encore actif (le premier code n'est pas validé). Un facteur non confirmé
-- n'est jamais compté comme second facteur, et la purge des 15 minutes efface ceux qui restent ainsi
CREATE TABLE auth_factor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM ('email', 'totp') NOT NULL,
    name VARCHAR(50) NOT NULL,
    secret_encrypted VARBINARY(255) NULL,
    key_version TINYINT UNSIGNED NULL,
    last_used_step INT NULL,
    last_used_at DATETIME(3) NULL,
    confirmed_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    -- Un seul facteur mail par compte (deux seraient interchangeables), autant de TOTP que voulu : rempli pour un
    -- facteur mail seulement, et un index unique accepte plusieurs NULL. Jamais écrit, ni lu par le modèle
    email_factor_user_id INT AS (IF(type = 'email', user_id, NULL)) VIRTUAL,
    CONSTRAINT uq_auth_factor_email_factor_user_id UNIQUE (email_factor_user_id),
    CONSTRAINT fk_auth_factor_user
        FOREIGN KEY (user_id) REFERENCES auth_user (id)
        ON DELETE CASCADE,
    CONSTRAINT ck_auth_factor_email_without_secret
        CHECK (type = 'totp' OR (secret_encrypted IS NULL AND key_version IS NULL AND last_used_step IS NULL)),
    CONSTRAINT ck_auth_factor_secret_with_key_version
        CHECK ((secret_encrypted IS NULL) = (key_version IS NULL) AND (key_version IS NULL OR key_version >= 1))
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

CREATE INDEX idx_auth_factor_user_id ON auth_factor (user_id);
