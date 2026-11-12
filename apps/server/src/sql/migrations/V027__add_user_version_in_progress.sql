-- « En cours » : une case par version jouée, indépendante du statut et cumulable avec « À jouer bientôt » (is_up_next).
-- Les versions déjà là ne sont pas en cours : c'est au joueur de les cocher

ALTER TABLE backlog_user_version
    ADD COLUMN is_in_progress BOOLEAN NOT NULL DEFAULT FALSE AFTER status;
