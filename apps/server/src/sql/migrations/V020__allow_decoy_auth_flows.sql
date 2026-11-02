-- Connexion par mail et mot de passe oublié répondent pareil pour un identifiant inconnu : un parcours est créé quand
-- même, sans compte (user_id NULL) ni code ni lien, et aucun mail ne part. Son cookie, son état et ses refus sont ceux
-- d'un vrai parcours : rien ne dit si le compte existe. L'inscription reste le seul parcours toujours sans compte ; les
-- autres (connexion avec second facteur, changement d'email, facteur mail) partent d'un compte connu
ALTER TABLE auth_flow
    DROP CONSTRAINT ck_auth_flow_user_id;

ALTER TABLE auth_flow
    ADD CONSTRAINT ck_auth_flow_user_id
        CHECK (
            (kind = 'registration' AND user_id IS NULL)
            OR (kind IN ('mail_login', 'password_reset'))
            OR (kind IN ('login', 'email_change', 'email_factor') AND user_id IS NOT NULL)
        );
