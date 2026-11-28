# Vidéos TikTok — fournisseur 14 €

## Style visuel (consigne de l'utilisateur)
- Toujours garder le style des premières vidéos (Kevin, Le calcul, 3 erreurs, Le jeu) :
  fond noir / vert lime (#C6FF3D) / bleu électrique (#2F47FF) / crème, typo Archivo Black,
  motion design énergique, 3D (texte extrudé, cartes, colis), floods et wipes, HUD caméra,
  sous-titres TikTok surlignés en vert.
- Ne PAS faire de style « luxe » (noir & or, serif élégant, rythme lent) comme la vidéo Dior,
  même pour des articles de luxe.

## Format « storytime 3D » (vidéo 20, `video/src_ville.html`)
- Format à garder en tête pour les prochaines demandes (selon la demande) : histoire racontée en voix off,
  ville 3D low-poly en blocs (three.js), personnages en blocs animés (Kevin = casquette rouge, moi = cheveux bruns),
  plans de caméra courts, sous-titre jaune mot par mot, « huss » à chaque coupe, musique de fond originale
  synthétisée, gags viraux (freeze + scratch sur le prix, bulles « ?! », cartes « LE LENDEMAIN »).
- Durée ~40 s. Réutiliser `src_ville.html` comme base (ville, personnages, caméra, sous-titres, musique).

## Production
- Moteur commun : `video/lib.js` ; une page par vidéo `video/src_<nom>.html`.
- Voix off : ElevenLabs, voix « Hugo – Punchy French Creator » (3Tp5mYhT9wrfnry9pzvV), modèle eleven_v4.
- Timings : transcription Scribe -> `video/words/<nom>.json`.
- Build : `node build.mjs src_<nom>.html <nom>.html` ; rendu : `node render.mjs <nom>.html <nom>.mp4 60 4 4` ;
  mix : `./mixv.sh <nom> voix_<nom>.mp3 <durée>`.
- Prix actuel du fournisseur : 49 € (fournisseur + groupe privé). Pas de musique (l'utilisateur l'ajoute). Livrer `_final` (voix + bruitages) et `_voix_seule`, en 60 fps.
- Ne jamais inventer de prix d'achat : les demander à l'utilisateur.
