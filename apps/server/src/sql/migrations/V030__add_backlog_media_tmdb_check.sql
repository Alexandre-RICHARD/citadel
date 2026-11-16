-- L'écart « Identifiant TMDB disparu » du backlog des médias (docs/backlog/backlog_media.md, §5) : chaque nuit, le job
-- media-tmdb fait relire sur TMDB un septième des films et des séries des backlogs, les moins récemment vérifiés
-- d'abord (tmdb_checked_at) ; un identifiant que TMDB ne connaît plus garde la date où il a disparu (tmdb_gone_at), et la
-- perd s'il revient. Une semaine couvre ainsi tout, sans jamais approcher la limite de débit de TMDB.
-- updated_at n'est pas touché par ces vérifications (voir markTmdbIdCheckedQuery)

ALTER TABLE backlog_movie
    ADD COLUMN tmdb_checked_at DATETIME(3) NULL AFTER collection_id,
    ADD COLUMN tmdb_gone_at DATETIME(3) NULL AFTER tmdb_checked_at;

ALTER TABLE backlog_tv_show
    ADD COLUMN tmdb_checked_at DATETIME(3) NULL AFTER is_ongoing,
    ADD COLUMN tmdb_gone_at DATETIME(3) NULL AFTER tmdb_checked_at;
