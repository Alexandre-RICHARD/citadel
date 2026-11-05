-- Chaque jeu du Game Death Counter appartient à un compte. La prod n'a aucune donnée à garder (cahier de
-- l'authentification, §1.2) : les jeux existants partent, leurs boss et leurs morts avec eux par cascade (V008), et
-- user_id est obligatoire dès maintenant. Boss et morts n'ont pas de user_id : leur propriétaire est celui du jeu
DELETE FROM gdc_game;

ALTER TABLE gdc_game
    ADD COLUMN user_id INT NOT NULL AFTER id;

-- La liste des jeux d'un compte, triée par nom. Créé avant la clé étrangère, qui s'en sert au lieu d'en créer un autre
CREATE INDEX idx_gdc_game_user_id_name ON gdc_game (user_id, name);

-- Supprimer le compte supprime ses jeux, et par cascade leurs boss et leurs morts
ALTER TABLE gdc_game
    ADD CONSTRAINT fk_gdc_game_user
        FOREIGN KEY (user_id) REFERENCES auth_user (id)
        ON DELETE CASCADE;
