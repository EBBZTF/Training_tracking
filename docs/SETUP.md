# Training — Einrichtung

Persönliche Trainings-App. Läuft als PWA auf dem iPhone, offline, ohne App Store und ohne Apple-Developer-Konto.

**Dateien in diesem Ordner:**

| Datei | Zweck |
|---|---|
| `index.html` | Markup |
| `style.css` | Gestaltung |
| `app.js` | Logik und Plandaten |
| `manifest.json` | Macht sie installierbar (Name, Icon, Vollbild) |
| `sw.js` | Service Worker für den Offline-Betrieb |
| `icon-180/192/512.png` | Icons für Home-Bildschirm und App-Umschalter |
| `icon-512-maskable.png` | Icon-Variante für Android |

Alle Dateien kommen **flach ins Repo-Wurzelverzeichnis**, ohne Unterordner. Die Pfade in `manifest.json` und `sw.js` gehen davon aus.

---

## Schritt 1 — Repository anlegen

1. Auf github.com oben rechts auf **+** → **New repository**
2. Name: `training` (frei wählbar, taucht später in der URL auf)
3. Sichtbarkeit: **Public**
4. **Add a README file** nicht ankreuzen — du lädst gleich deine eigene hoch
5. **Create repository**

### Warum öffentlich?

GitHub Pages funktioniert im kostenlosen Tarif nur mit öffentlichen Repositories. Für private Repos brauchst du GitHub Pro.

Das ist hier unkritisch: Öffentlich ist nur der Programmcode. **Deine Trainingsdaten landen nie im Repo** — sie liegen ausschliesslich im Speicher deines iPhones. Wer die URL kennt, sieht eine leere App, nicht deine Werte.

Was du beachten solltest: Trägst du später persönliche Notizen direkt in `index.html` ein (etwa Befunde deiner Physio in den Anleitungstexten), stünden die öffentlich. Solche Dinge gehören in die App selbst über "Plan bearbeiten", nicht in den Quelltext.

---

## Schritt 2 — Dateien hochladen

Im leeren Repository auf **uploading an existing file** klicken (oder **Add file** → **Upload files**).

Alle Dateien aus diesem Ordner **gleichzeitig** ins Feld ziehen. Unten **Commit changes**.

---

## Schritt 3 — Pages aktivieren

1. Im Repository auf **Settings** (oben rechts im Repo-Menü, nicht das Konto-Menü)
2. Links in der Seitenleiste auf **Pages**
3. Unter *Build and deployment* → *Source*: **Deploy from a branch**
4. *Branch*: **main**, Ordner **/ (root)** → **Save**

Nach ein bis zwei Minuten steht oben auf derselben Seite deine Adresse:

```
https://DEINNAME.github.io/training/
```

Lädt sie noch nicht, warte kurz und aktualisiere. Der erste Aufbau dauert manchmal etwas.

---

## Schritt 4 — Auf dem iPhone installieren

1. Die Adresse **in Safari** öffnen. Chrome und Firefox auf iOS können keine Web-Apps installieren — das geht nur über Safari.
2. Teilen-Symbol antippen (Quadrat mit Pfeil nach oben)
3. Nach unten scrollen → **Zum Home-Bildschirm**
4. Name bestätigen → **Hinzufügen**

Ab jetzt startest du sie über das Icon. Sie öffnet im Vollbild, ohne Safari-Leiste, und funktioniert offline.

**Wichtig:** Benutze ab jetzt nur noch das Icon vom Home-Bildschirm, nicht mehr das Safari-Lesezeichen. Beide haben getrennte Speicher — Werte, die du in Safari einträgst, tauchen in der installierten App nicht auf.

---

## Etwas ändern

Kleine Korrekturen — Übungen, Sätze, Notizen — machst du direkt in der App unter "Plan". Dafür musst du das Repo nicht anfassen.

Am Code selbst änderst du so:

1. Im Repo auf die betroffene Datei (`index.html` für Markup, `style.css` für Gestaltung, `app.js` für Logik/Plandaten) → Stift-Symbol oben rechts
2. Ändern → **Commit changes**
3. **In `sw.js` die Zahl bei `VERSION` um eins erhöhen** und ebenfalls committen

Der dritte Schritt ist der, den man vergisst. Ohne ihn zeigt dein iPhone hartnäckig die alte zwischengespeicherte Fassung, und du suchst den Fehler im falschen Code.

Danach die App schliessen (im App-Umschalter nach oben wischen) und neu öffnen.

---

## Deine Daten sichern

Die App speichert im `localStorage` deines iPhones. **iOS löscht diesen Speicher, wenn eine Web-App mehrere Wochen nicht geöffnet wird.**

Deshalb: alle paar Wochen unter **Daten** → **Als JSON exportieren** und die Datei in der Dateien-App oder iCloud ablegen. Über **JSON importieren** holst du alles zurück.

Es lohnt sich, das gleich beim ersten Öffnen einmal durchzuspielen, damit du den Weg kennst. Der Moment, in dem du ihn brauchst, ist der ungünstigste zum Ausprobieren.

Ein Backup ist auch nötig, bevor du das Gerät wechselst — die Daten wandern nicht automatisch mit.

---

## Wenn etwas nicht geht

**Seite bleibt weiss oder zeigt 404**
Pages braucht ein bis zwei Minuten. Prüfe unter Settings → Pages, ob Branch `main` und Ordner `/ (root)` eingestellt sind, und ob `index.html` wirklich im Wurzelverzeichnis liegt und nicht in einem Unterordner.

**Kein Icon, kein Vollbild**
`manifest.json` und die PNGs müssen neben `index.html` liegen. Prüfen kannst du das, indem du `https://DEINNAME.github.io/training/manifest.json` direkt aufrufst — kommt eine 404, liegt die Datei falsch.

**Änderungen erscheinen nicht**
`VERSION` in `sw.js` erhöht? App vollständig geschlossen und neu geöffnet?

**Nach einem Update stehen noch die alten Trainingstage in der App**
Der Plan wird beim ersten Start gespeichert und danach nicht mehr überschrieben — sonst würden deine eigenen Änderungen verloren gehen. Nach einem Struktur-Update einmal **Daten** → **Plan auf Ausgangsversion zurücksetzen**. Protokollierte Einheiten bleiben dabei erhalten.

**Daten weg**
Wurde die App über Safari statt über das Home-Bildschirm-Icon geöffnet? Oder war sie länger als ein paar Wochen ungenutzt? Dann hilft nur der JSON-Import.
