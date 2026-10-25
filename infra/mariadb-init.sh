#!/usr/bin/env bash
# =====================================================================================
# mariadb-init.sh : crée la base et les comptes de Citadel, à la PREMIÈRE initialisation
# =====================================================================================
#
# Qui le lance ?
#   L'image officielle MariaDB exécute les scripts de /docker-entrypoint-initdb.d/
#   une seule fois : quand son dossier de données (/var/lib/mysql) est vide.
#   Ensuite, ce script n'est plus jamais relu. Pour le rejouer, il faut repartir d'une
#   base vide (en dev : `pnpm db:reset` ; la base de test est neuve à chaque lancement).
#
# Où sert-il ?
#   - sur ton PC : mariadb-dev et mariadb-test (compose.dev.yml) ;
#   - sur le NAS : site-prod-db (infra/compose.yml), puis la pré-prod.
#   Le même fichier partout : la base de dev a la même structure de comptes que la prod.
#
# Ce qu'il reçoit (variables d'environnement du conteneur, posées par compose) :
#   DB_DATABASE_NAME      nom de la base : citadel_dev, citadel_test, citadel…
#   DB_USER_NAME          compte du serveur Express
#   DB_USER_PASSWORD      son mot de passe
#   DB_MIGRATOR_PASSWORD  (prod seulement) mot de passe du compte citadel_migrator
#   DB_BACKUP_PASSWORD    (prod seulement) mot de passe du compte citadel_backup
#   MARIADB_ROOT_PASSWORD posé par compose : l'image en a besoin, et ce script s'en sert
#
# Les comptes (cahier des charges, §12.5) :
#   - En prod, trois comptes aux droits séparés :
#       DB_USER_NAME     (citadel_app)  lire et écrire les données, rien d'autre ;
#       citadel_migrator                structure et données de la base (Flyway, DBeaver) ;
#       citadel_backup                  lecture seule, pour les dumps.
#     Une faille dans le serveur ne permet donc ni de supprimer une table, ni d'en créer.
#   - En dev et en test, DB_MIGRATOR_PASSWORD est absent : un seul compte fait tout,
#     car Flyway s'en sert aussi pour appliquer les migrations. Plus simple, sans risque :
#     ces bases n'écoutent que sur 127.0.0.1 de ton PC et ne contiennent rien d'important.
#
# Lancé ou « sourcé » ?
#   L'image exécute ce fichier s'il est exécutable, sinon elle l'inclut dans son propre
#   script (« source »). Pour marcher dans les deux cas, tout le travail se fait dans une
#   fonction entre parenthèses : elle tourne dans un sous-processus, donc ses réglages
#   (set -u…) et un éventuel `exit` ne touchent jamais au script de l'image.

citadel_mariadb_init() (
	# -e : s'arrêter à la première erreur ; -u : variable inconnue = erreur ;
	# pipefail : une commande qui échoue dans un « | » fait échouer toute la ligne
	set -euo pipefail

	# --- Vérifications : un oubli dans le fichier d'environnement s'arrête ici, en clair ---
	: "${DB_DATABASE_NAME:?DB_DATABASE_NAME manquant}"
	: "${DB_USER_NAME:?DB_USER_NAME manquant}"
	: "${DB_USER_PASSWORD:?DB_USER_PASSWORD manquant}"

	# Échappe une valeur pour l'écrire entre apostrophes dans du SQL :
	# antislash → \\ , apostrophe → \' (même règle que le script de l'image).
	# Sans ça, un mot de passe contenant ' casserait la requête, ou pire, la détournerait.
	sql_string() {
		local escaped=${1//\\/\\\\}
		printf '%s' "${escaped//\'/\\\'}"
	}

	# Un nom de base ou de compte n'est jamais échappé : on le limite donc à des
	# caractères sans danger (lettres, chiffres, _), vérifiés ici.
	for identifier in "$DB_DATABASE_NAME" "$DB_USER_NAME"; do
		if [[ ! $identifier =~ ^[A-Za-z0-9_]+$ ]]; then
			echo "mariadb-init : nom invalide « $identifier » (lettres, chiffres et _ seulement)" >&2
			exit 1
		fi
	done

	local database=$DB_DATABASE_NAME
	local app_user=$DB_USER_NAME

	# --- Le SQL à exécuter, construit par morceaux ---
	# Base en utf8mb4 (tous les caractères, émojis compris), même collation qu'avant.
	# (déclarée puis remplie : sinon une erreur dans un $(…) passerait inaperçue)
	local sql
	sql="
		CREATE DATABASE IF NOT EXISTS \`${database}\`
			CHARACTER SET = 'utf8mb4'
			COLLATE = 'utf8mb4_unicode_520_ci';

		-- '%' : joignable depuis les autres conteneurs. Le port de la base n'est publié
		-- que sur 127.0.0.1 (ton PC, ou le NAS lui-même) : rien n'arrive du réseau.
		CREATE USER IF NOT EXISTS '${app_user}'@'%'
			IDENTIFIED BY '$(sql_string "$DB_USER_PASSWORD")';
	"

	if [[ -n ${DB_MIGRATOR_PASSWORD:-} ]]; then
		# Prod : le serveur ne fait que lire et écrire des lignes
		sql+="
			GRANT SELECT, INSERT, UPDATE, DELETE ON \`${database}\`.* TO '${app_user}'@'%';

			-- Flyway, et toi dans DBeaver : tout sur cette base, rien ailleurs.
			-- ALL PRIVILEGES n'inclut pas GRANT OPTION : il ne peut pas donner de droits.
			CREATE USER IF NOT EXISTS 'citadel_migrator'@'%'
				IDENTIFIED BY '$(sql_string "$DB_MIGRATOR_PASSWORD")';
			GRANT ALL PRIVILEGES ON \`${database}\`.* TO 'citadel_migrator'@'%';
		"
	else
		# Dev et test : le compte du serveur sert aussi à Flyway, il lui faut la structure
		sql+="
			GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, REFERENCES, INDEX, ALTER,
				CREATE TEMPORARY TABLES, CREATE VIEW, SHOW VIEW, TRIGGER
				ON \`${database}\`.* TO '${app_user}'@'%';
		"
	fi

	if [[ -n ${DB_BACKUP_PASSWORD:-} ]]; then
		# Les droits minimaux de mariadb-dump --single-transaction (cahier des charges, §11.3) :
		# lire les tables et les vues, voir triggers, événements et procédures
		sql+="
			CREATE USER IF NOT EXISTS 'citadel_backup'@'%'
				IDENTIFIED BY '$(sql_string "$DB_BACKUP_PASSWORD")';
			GRANT SELECT, SHOW VIEW, TRIGGER, EVENT, LOCK TABLES, SHOW CREATE ROUTINE
				ON \`${database}\`.* TO 'citadel_backup'@'%';
		"
	fi

	# --- Exécution ---
	# Pendant l'initialisation, l'image fait tourner un serveur temporaire joignable
	# seulement par son « socket » (un fichier local), avec le compte root.
	# MYSQL_PWD passe le mot de passe sans qu'il apparaisse dans la liste des processus.
	MYSQL_PWD=$MARIADB_ROOT_PASSWORD mariadb --protocol=socket --user=root <<<"$sql"

	echo "mariadb-init : base « ${database} » et comptes créés"
)

citadel_mariadb_init
