-- Chaque projet préfixe ses tables (gdc_…, backlog_…) : le Backlog a aussi une table de jeux.
-- RENAME TABLE garde les données, les colonnes et les clés étrangères, qui suivent les tables renommées.
RENAME TABLE
    game TO gdc_game,
    boss TO gdc_boss,
    death TO gdc_death;

-- Contraintes et index prennent le même préfixe. Une clé étrangère ne se renomme pas :
-- on la supprime puis on la recrée, à l'identique. L'index qu'elle utilise reste en place entre les deux.
ALTER TABLE gdc_boss DROP FOREIGN KEY fk_boss_game;
ALTER TABLE gdc_boss RENAME INDEX idx_boss_game_id TO idx_gdc_boss_game_id;
ALTER TABLE gdc_boss
    ADD CONSTRAINT fk_gdc_boss_game
        FOREIGN KEY (game_id) REFERENCES gdc_game (id)
        ON DELETE CASCADE;

ALTER TABLE gdc_death DROP FOREIGN KEY fk_death_boss;
ALTER TABLE gdc_death RENAME INDEX idx_death_boss_id TO idx_gdc_death_boss_id;
ALTER TABLE gdc_death
    ADD CONSTRAINT fk_gdc_death_boss
        FOREIGN KEY (boss_id) REFERENCES gdc_boss (id)
        ON DELETE CASCADE;
