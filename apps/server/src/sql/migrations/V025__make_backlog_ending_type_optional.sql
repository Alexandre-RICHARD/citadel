-- Type de fin facultatif : un jeu du backlog peut n'en avoir aucun. Sans type de fin, aucun statut de fin (règle tenue
-- par le serveur : un type de fin ne se retire pas tant qu'une version jouée a un statut de fin)

ALTER TABLE backlog_user_game
    MODIFY COLUMN ending_type ENUM ('story', 'runs', 'sandbox', 'multiplayer') NULL;
