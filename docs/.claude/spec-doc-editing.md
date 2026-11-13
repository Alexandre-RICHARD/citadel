---
name: spec-doc-editing
description: Comment éditer un document de spec ou de doc quand l'utilisateur répond : modifs ciblées, jamais de réécriture, options écartées supprimées
metadata:
  type: feedback
---

Quand l'utilisateur répond à des questions sur un document :
- Dès qu'il choisit une option, supprimer tout ce qui concerne les autres ; pas de section « alternatives écartées ».
- Retirer les questions résolues ; n'en ajouter que pour de vrais manques, ambiguïtés ou contradictions, chacune avec une recommandation.
- Ne modifier que ce que les réponses changent, par des Edit ciblés, un par changement concret. Ne jamais reformuler un passage non concerné : il relit le diff, et la reformulation le rend illisible. En supprimant, retirer les lignes et laisser les autres à l'identique. Dire dans la réponse quelles sections ont changé.

**Why:** dit le 2026-10-25, puis répété **fermement** le 2026-10-30 : la v4 de la spec d'auth était une réécriture complète, et il a passé 2 heures sur un diff composé à plus de 80 % de reformulation et de mise en page.

**How to apply:** ne jamais réécrire un document entier pour le « nettoyer ». Quand le travail décrit par un document est fait, supprimer ce qui ne servait qu'à le construire (instructions pour créer des fichiers qui existent). Voir [[docs-organization]].
