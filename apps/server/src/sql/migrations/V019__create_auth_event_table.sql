-- Journal de sécurité (échecs, inscriptions, connexions, changements de 2FA, de mot de passe ou d'email), purgé à
-- 20 jours. user_id NULL : aucun compte trouvé (identifiant inconnu, inscription). type en texte, comme
-- mailing_failure.kind : un nouveau type d'événement ne demande pas de migration.
-- ip tronquée comme dans auth_session ; user_agent NULL quand le navigateur n'en envoie pas
CREATE TABLE auth_event (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    type VARCHAR(50) NOT NULL,
    ip VARCHAR(45) NOT NULL,
    user_agent VARCHAR(255) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_auth_event_user
        FOREIGN KEY (user_id) REFERENCES auth_user (id)
        ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;

CREATE INDEX idx_auth_event_user_id ON auth_event (user_id);
-- La purge quotidienne des événements de plus de 20 jours
CREATE INDEX idx_auth_event_created_at ON auth_event (created_at);
