# Alignement mot à mot sans API (secours quand la transcription ElevenLabs est indisponible).
# Pauses détectées (silencedetect) + programmation dynamique : chaque pause retenue tombe entre deux mots,
# de préférence après une ponctuation, et la durée de parole entre pauses colle au nombre de syllabes.
# python3 align.py voix.mp3 "texte" words/out.json
import sys, re, json, subprocess
mp3, text, out = sys.argv[1:4]
PEN = float(sys.argv[4]) if len(sys.argv) > 4 else 2.5
dur = float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',mp3],capture_output=True,text=True).stdout)
log = subprocess.run(['ffmpeg','-i',mp3,'-af','silencedetect=n=-36dB:d=0.07','-f','null','-'],capture_output=True,text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]; en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
gaps = [(a, b) for a, b in zip(st, en) if a > 0.05 and b < dur - 0.05]
t0 = en[0] if st and st[0] < 0.05 else 0.0
t1 = st[-1] if len(st) > len(en) or (st and en and st[-1] > en[-1]) else dur
words = []
for w in re.sub(r'\[[^\]]*\]', ' ', text).split():
    if w in ('?', '!', ':', ';') and words: words[-1] += w  # ponctuation isolée -> mot précédent
    elif w not in ('«', '»'): words.append(w)
def syl(w):
    w = re.sub(r"[^a-zàâäéèêëîïôöùûüç'-]", '', w.lower())
    n = len(re.findall(r'[aeiouyàâäéèêëîïôöùûü]+', w)); n -= 1 if w.endswith('e') and n > 1 else 0
    if re.search(r'\d', w): n = 3
    return max(1, n) + 0.35
S = [syl(w) for w in words]; P = [1 if re.search(r'[.,?!:…]$', w) else 0 for w in words]
pre = [0]
for s in S: pre.append(pre[-1] + s)
n, m = len(words), len(gaps)
speech = (t1 - t0) - sum(b - a for a, b in gaps)
r = speech / pre[-1]
INF = 1e18
def segcost(i, j, D):  # mots i..j-1 sur une durée D
    e = r * (pre[j] - pre[i]); return (D - e) ** 2 / (e + 0.25)
# états : (pause k utilisée comme frontière après le mot b) ; départ virtuel (-1, 0) à t0
best = {(-1, 0): (0.0, None)}
order = [(-1, 0)]
starts = lambda k: t0 if k < 0 else gaps[k][1]
for k in range(m):
    for b in range(1, n):
        c_best, arg = INF, None
        for (pk, pb) in order:
            if pk >= k or pb >= b: continue
            c0 = best[(pk, pb)][0]
            skipped = sum(gaps[x][1] - gaps[x][0] for x in range(pk + 1, k))
            D = gaps[k][0] - starts(pk) - 0  # durée incluant pauses ignorées (on retire le silence ignoré)
            D -= skipped
            skip_pen = sum(min(1.5, (gaps[x][1] - gaps[x][0]) * 6) for x in range(pk + 1, k))
            c = c0 + segcost(pb, b, D) + (0 if P[b - 1] else PEN) + skip_pen
            if c < c_best: c_best, arg = c, (pk, pb)
        if arg is not None: best[(k, b)] = (c_best, arg); order.append((k, b))
# fin
fin, farg = INF, None
for (k, b) in order:
    skipped = sum(gaps[x][1] - gaps[x][0] for x in range(k + 1, m)); skip_pen = sum(min(1.5, (gaps[x][1] - gaps[x][0]) * 6) for x in range(k + 1, m))
    c = best[(k, b)][0] + segcost(b, n, t1 - starts(k) - skipped) + skip_pen
    if c < fin: fin, farg = c, (k, b)
path = []; cur = farg
while cur and cur != (-1, 0): path.append(cur); cur = best[cur][1]
path.reverse()
bounds = [(-1, 0)] + path
res = []
for idx, (k, b) in enumerate(bounds):
    a = starts(k); nk, nb = bounds[idx + 1] if idx + 1 < len(bounds) else (m, n)
    end = gaps[nk][0] if nk < m else t1
    inner = [g for g in gaps[k + 1:nk]]
    tot = pre[nb] - pre[b]; t = a
    for wi in range(b, nb):
        d = (end - a - sum(y - x for x, y in inner)) * S[wi] / tot
        while inner and t + 1e-6 >= inner[0][0]: t = max(t, inner[0][1]); inner.pop(0)
        wt = words[wi]; pm = re.search(r'[?!:;]$', wt)
        res.append({'text': wt[:-1] if pm else wt, 'type': 'word', 'start': round(t, 3), 'end': round(t + d * .9, 3)})
        if pm: res.append({'text': pm.group(0), 'type': 'word', 'start': round(t + d * .9, 3), 'end': round(t + d, 3)})
        t += d
    print(f'{a:6.2f}-{end:6.2f}', ' '.join(words[b:nb]))
json.dump({'words': res}, open(out, 'w'), ensure_ascii=False)
print('->', out, len(gaps), 'pauses')
