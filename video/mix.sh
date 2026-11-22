#!/bin/bash
# Mix voix off + bruitages sur la vidéo rendue. Pas de musique (ajoutée sur TikTok).
set -e
V=kevin_video.mp4
# 1) voix + SFX (SFX ~ -10 dB sous la voix), normalisé -14 LUFS (standard TikTok)
ffmpeg -v error -y -i $V -i voix.mp3 -i kevin_sfx.wav -filter_complex \
 "[1:a]aresample=48000,apad[vo];[2:a]volume=0.32[fx];[vo][fx]amix=inputs=2:duration=longest:normalize=0,atrim=0:40,loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
 -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -t 40 kevin_final.mp4
# 2) voix seule (sans bruitages)
ffmpeg -v error -y -i $V -i voix.mp3 -filter_complex "[1:a]aresample=48000,apad,atrim=0:40,loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
 -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -t 40 kevin_voix_seule.mp4
echo done
