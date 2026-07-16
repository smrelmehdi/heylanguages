# Egyptian pacing sample v2: bad-three retry

Tmp-only retry variants for:
- basic-05 / كويس
- basic-10 / شوية
- basic-15 / ماية

```bash
for f in tmp/egyptian-pacing-sample-v2/bad-three-retry/*.mp3; do echo "$f"; afplay "$f"; done
```
