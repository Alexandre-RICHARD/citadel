-- createdAt prend le rôle de started_at
ALTER TABLE game
    ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

UPDATE game SET created_at = started_at, updated_at = started_at;

ALTER TABLE game
    DROP COLUMN started_at;

-- boss : createdAt/updatedAt en plus, defeated_at ne change pas
ALTER TABLE boss
    ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- death : createdAt/updatedAt en plus, `date` reste la donnée éditable
ALTER TABLE death
    ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
