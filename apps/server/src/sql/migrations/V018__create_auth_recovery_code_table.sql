-- Codes de secours d'un compte, à usage unique : seulement leur SHA-256. used_at NULL : encore utilisable
CREATE TABLE auth_recovery_code (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    code_hash BINARY(32) NOT NULL,
    used_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    -- Sert aussi d'index à la clé étrangère et à la recherche d'un code tapé
    CONSTRAINT uq_auth_recovery_code_user_code UNIQUE (user_id, code_hash),
    CONSTRAINT fk_auth_recovery_code_user
        FOREIGN KEY (user_id) REFERENCES auth_user (id)
        ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;
