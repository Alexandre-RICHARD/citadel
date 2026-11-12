-- « Runs » propose les mêmes statuts que « Multijoueur » et « Bac à sable » : « Estimé fini » au lieu de « Fini », et
-- « Vu sans jouer » réservé à « Histoire ». Les versions jouées des jeux en « Runs » suivent : Fini → Estimé fini,
-- Vu sans jouer → Pas commencé (ne pas avoir joué un jeu qui n'est pas une histoire ne peut pas valoir fin).
-- updated_at est recopié tel quel : une migration ne compte pas comme une modification du joueur (tri par défaut)

UPDATE backlog_user_version uv
    JOIN backlog_version v ON v.id = uv.version_id
    JOIN backlog_user_game ug ON ug.game_id = v.game_id AND ug.user_id = uv.user_id
SET uv.status = CASE uv.status WHEN 'finished' THEN 'deemedFinished' ELSE 'notStarted' END,
    uv.updated_at = uv.updated_at
WHERE ug.ending_type = 'runs' AND uv.status IN ('finished', 'watched');
