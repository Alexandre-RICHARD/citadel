-- Les messages du formulaire de contact dont la notification n'a pas pu partir (fournisseur de mails injoignable, clé
-- refusée, quota épuisé) : le message complet est gardé ici pour que la personne ne soit pas perdue. Contrairement aux
-- autres mails, qui ne laissent qu'une ligne dans mail_failure. La console du NAS en affiche le nombre ; une ligne
-- se supprime à la main une fois le message lu. Jamais l'IP du visiteur
CREATE TABLE contact_message_unsent (
    id INT AUTO_INCREMENT PRIMARY KEY,

    subject VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    name VARCHAR(100) NULL,
    email VARCHAR(254) NULL,

    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;
