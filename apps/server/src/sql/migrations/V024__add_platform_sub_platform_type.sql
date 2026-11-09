-- Sous-plateformes : une plateforme enfant (émulateur ou launcher) est rattachée à une plateforme parente.
-- La colonne emulated_platform_id devient parent_platform_id, et sub_platform_type dit ce qu'est l'enfant

ALTER TABLE backlog_platform
    DROP FOREIGN KEY fk_backlog_platform_emulated_platform;

ALTER TABLE backlog_platform
    CHANGE COLUMN emulated_platform_id parent_platform_id INT NULL,
    ADD COLUMN sub_platform_type ENUM ('emulator', 'launcher') NULL AFTER parent_platform_id;

-- Jusqu'ici, tout enfant était un émulateur ; les launchers PC de V023 (enfants du PC, id 6) en étaient insérés comme tels
UPDATE backlog_platform
SET sub_platform_type = CASE WHEN parent_platform_id = 6 THEN 'launcher' ELSE 'emulator' END
WHERE parent_platform_id IS NOT NULL;

ALTER TABLE backlog_platform
    ADD CONSTRAINT fk_backlog_platform_parent_platform
        FOREIGN KEY (parent_platform_id) REFERENCES backlog_platform (id),
    -- Une plateforme a un type d'enfant si, et seulement si, elle a un parent
    ADD CONSTRAINT ck_backlog_platform_sub_platform_type
        CHECK ((parent_platform_id IS NULL) = (sub_platform_type IS NULL));
