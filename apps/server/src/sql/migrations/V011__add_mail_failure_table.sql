-- Les mails du site qui n'ont pas pu partir (fournisseur injoignable, clé refusée, quota épuisé). Ni adresse ni contenu :
-- le type du mail et la raison donnée par le fournisseur. La console du NAS en affiche le nombre ; les lignes de plus
-- de 90 jours s'effacent à chaque nouvel échec
CREATE TABLE mail_failure (
    id INT AUTO_INCREMENT PRIMARY KEY,

    kind VARCHAR(50) NOT NULL,
    reason VARCHAR(500) NOT NULL,

    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX idx_mail_failure_created_at (created_at)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_520_ci;
