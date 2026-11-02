-- Un préfixe par sujet (backlog_, gdc_, mailing_, auth_) : les tables des mails prennent mailing_.
-- RENAME TABLE garde les données, les colonnes et les index. Non rétrocompatible : l'ancienne version du serveur
-- ne trouve plus ses tables, le retour arrière passe par la restauration du dump d'avant déploiement.
RENAME TABLE
    mail_failure TO mailing_failure,
    contact_message_unsent TO mailing_contact_message_unsent;

ALTER TABLE mailing_failure RENAME INDEX idx_mail_failure_created_at TO idx_mailing_failure_created_at;
