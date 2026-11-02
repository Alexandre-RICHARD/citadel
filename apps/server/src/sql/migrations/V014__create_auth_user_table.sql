-- Compte d'un utilisateur, partagé par tous les projets.
-- email : la casse ne compte pas, les accents oui (Alex@ et alex@ sont une seule adresse, josé@ et jose@ deux), comme
-- les messageries ; gardé tel que saisi, c'est l'adresse du mail.
-- username : identifiant définitif, chaque caractère compte (Alex et alex sont deux comptes).
-- display_name NULL : le pseudo affiché est le username
CREATE TABLE auth_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(254) NOT NULL COLLATE utf8mb4_uca1400_as_ci,
    username VARCHAR(64) NOT NULL COLLATE utf8mb4_bin,
    display_name VARCHAR(64) NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_changed_at DATETIME(3) NOT NULL,
    login_methods ENUM ('mail', 'password', 'both') NOT NULL DEFAULT 'both',
    last_login_at DATETIME(3) NULL,
    last_seen_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT uq_auth_user_email UNIQUE (email),
    CONSTRAINT uq_auth_user_username UNIQUE (username)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;
