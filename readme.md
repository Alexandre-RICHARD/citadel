Dans Github
  -> Settings
  -> Developper settings
  -> Personnal access token
  -> Token classic
  -> Générer un nouveau token classic
    -> Nom
    -> Durée de validité ?
    -> Droit = read:packages
      Download packages from GitHub Package Registry
    -> Le copié

Connexion en ssh au serveur hébergeur
  -> Créer un dossier quelque part
  -> Installer git `apt-get install git`
  -> `git clone https://github.com/Alexandre-RICHARD/alex-deploy .`
  -> Ajouter le .env (le même que celui du répo local qui ne sert à rien en local)

  -> Se connecter au repository des images github
    `docker login ghcr.io -u <github user> -p <token classic>`

Dans le répo alex-deploy
  -> Settings
  -> Actions
  -> Runners
  -> New runner
  -> Suivre les commandes fournies par Github
    Pour la commande ./config.sh, rajouter `RUNNER_ALLOW_RUNASROOT=true` devant
    Entrer les infos demandées
    Pour la commande `./run.sh`, remplacer par
      `RUNNER_ALLOW_RUNASROOT=1 ./svc.sh install`
      `RUNNER_ALLOW_RUNASROOT=1 ./svc.sh start`

Sur Github, les secrets à renseigner
  -> FRONT
    -> VITE_API_ADRESS
  -> BACK

  -> DEPLOY
    -> SSH_PRIVATE_KEY
      -> `ssh-keygen -t ed25519 -C "github-actions-deploy"`
      -> `cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys`
      -> `chmod 600 ~/.ssh/authorized_keys`
      -> Copier le contenu de la clé privé pour la coller dans le secret
    -> SSH_USER (utilisateur avec lequel on se connecte en ssh)
    -> SSH_HOST (adresse local du serveur)
    -> SSH_TARGET_FOLDER (dossier dans lequel on a clone le projet)
  
  -> Tester la connexion
    -> `cd <path du repo>`
    -> `ssh -i ~/.ssh/id_ed25519 -p <port> -o StrictHostKeyChecking=no @IP_DE_TON_NAS "echo 'Connexion SSH OK'"`



docker exec mariadb mariadb-dump -u root -p"TON_MOT_DE_PASSE_ROOT" --all-databases > ~/backups/db_backup_$(date +%Y%m%d).sql
