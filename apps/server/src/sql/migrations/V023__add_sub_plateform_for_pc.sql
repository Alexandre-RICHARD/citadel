-- 1. Insertion du PC (s'il n'existe pas déjà)
INSERT INTO backlog_platform (id, short_name, technical_name, emulated_platform_id)
VALUES (6, 'PC', 'win', NULL)
ON DUPLICATE KEY UPDATE short_name = VALUES(short_name);

-- 2. Insertion des launchers PC rattachés au PC (id 6)
INSERT INTO backlog_platform (id, short_name, technical_name, emulated_platform_id)
VALUES
    (-3, 'Steam', 'steam', 6),
    (-4, 'Epic Games Store', 'epic-games', 6),
    (-5, 'GOG Galaxy', 'gog', 6),
    (-6, 'Xbox App', 'xbox-app', 6),
    (-7, 'EA App', 'ea-app', 6),
    (-8, 'Ubisoft Connect', 'ubisoft-connect', 6),
    (-9, 'Battle.net', 'battlenet', 6),
    (-10, 'Riot Client', 'riot-client', 6),
    (-11, 'Rockstar Launcher', 'rockstar-launcher', 6),
    (-12, 'Itch.io', 'itch-io', 6),
    (-13, 'Ankama Launcher', 'ankama-launcher', 6),
    (-14, 'Minecraft Launcher', 'minecraft-launcher', 6)
ON DUPLICATE KEY UPDATE short_name = VALUES(short_name);
