#!/bin/bash
# ./mixv.sh <nom> <voix.mp3> <durée>  -> <nom>_final_60fps.mp4 (voix+SFX) et <nom>_voix_seule_60fps.mp4
set -e
N=$1; VO=$2; D=$3; V=${N}_video.mp4
ffmpeg -v error -y -i $V -i $VO -i ${N}_sfx.wav -filter_complex \
 "[1:a]aresample=48000,apad[vo];[2:a]volume=0.32[fx];[vo][fx]amix=inputs=2:duration=longest:normalize=0,atrim=0:$D,loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
 -map 0:v -map "[a]" -c:v libx264 -crf 21 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -t $D ${N}_final_60fps.mp4
ffmpeg -v error -y -i $V -i $VO -filter_complex "[1:a]aresample=48000,apad,atrim=0:$D,loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
 -map 0:v -map "[a]" -c:v libx264 -crf 21 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -t $D ${N}_voix_seule_60fps.mp4
rm -f $V ${N}_sfx.wav
echo "$N done"
