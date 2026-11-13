-- Un seul statut « Fini » pour tous les types de fin : « Estimé fini » (deemedFinished) y est fusionné, et c'est le
-- libellé qui s'adapte au type de fin du jeu (« Estimé fini » pour Runs, Bac à sable et Multijoueur). Aucune perte :
-- « Estimé fini » n'était proposé que pour ces trois types.
-- updated_at est recopié tel quel : une migration ne compte pas comme une modification du joueur (tri par défaut)

UPDATE backlog_user_version
SET status = 'finished',
    updated_at = updated_at
WHERE status = 'deemedFinished';

-- La valeur disparaît de la colonne, et les statuts prennent leur nouvel ordre : Pas commencé, Abandonné, À peine joué,
-- Bien entamé, puis les statuts de fin
ALTER TABLE backlog_user_version
    MODIFY COLUMN status ENUM (
        'notStarted', 'abandoned', 'started', 'wellUnderway', 'watched', 'finished',
        'completed', 'platinum', 'completedAndPlatinum'
    ) NOT NULL DEFAULT 'notStarted';
