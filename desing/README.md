# Handoff: Underground KB Mobile

Companion mobile app a kettlebell-alapú edzésprogramhoz. Sportoló (atléta) felhasználói felület, dark mode, magyar nyelvű, narancs akcent színnel.

---

## About the Design Files

A csomagban található fájlok **HTML/React prototípusok**, amelyek a tervezett megjelenést és viselkedést mutatják be — **nem közvetlenül leszállítandó produkciós kód**.

A feladat: **újraépíteni ezeket a képernyőket a célalkalmazás meglévő környezetében** (pl. React Native, Expo, SwiftUI, Flutter, Jetpack Compose, vagy más natív / hibrid keretrendszer) az ott bevett komponens-mintákat, design tokeneket, navigációs primitíveket és tipográfiai rendszert használva.

Ha még nincs kódbázis, válasszátok ki a feladathoz legjobban illő keretrendszert (mobile companion app esetén javasolt: **React Native + Expo**, vagy **SwiftUI / Jetpack Compose** natívan) és valósítsátok meg ott a designt.

A prototípus React + inline CSS-szel készült, hogy gyorsan iterálható legyen — **ne emeljétek át az inline stílusokat 1:1-be**. A pontos design tokeneket lent megtaláljátok.

## Fidelity

**Magas fidelity (hi-fi)**. A színek, tipográfia, távolságok, ikonok és interakciók véglegesnek tekinthetők, ahol nincs ennek ellenkezője jelölve. A pixelpontos megvalósítás a cél a célplatformon, de a célplatform natív primitíveit (gomb, lista, input, navigation bar) kell használni — ne pixelről pixelre lemásolni, ha a natív komponens jobban illeszkedik a platform paradigmájához.

---

## Design Tokens

### Színek

| Token | Hex | Használat |
|---|---|---|
| `bg` | `#0f172a` | Fő háttér (dark mode app shell) |
| `bgDeep` | `#080d18` | Mélyebb háttér (extra réteg) |
| `card` | `#1e293b` | Kártyák, input háttér |
| `cardHi` | `#27344a` | Kiemelt kártya / hover állapot |
| `border` | `#334155` | Erős border (input fókusz) |
| `borderSoft` | `#1e2a3f` | Halvány border (kártya keret, elválasztó) |
| `text` | `#f1f5f9` | Elsődleges szöveg |
| `textDim` | `#94a3b8` | Másodlagos / leíró szöveg |
| `textMute` | `#64748b` | Tercier / label / overline |
| `accent` | `#f97316` | Márka narancs (CTA, aktív állapot, kiemelés) |
| `accentDeep` | `#c2410c` | Sötétebb narancs (gradient végpont, avatar) |
| `accentSoft` | `rgba(249,115,22,0.14)` | Halvány narancs háttér (ikon kontainer, kiemelés) |
| `good` | `#10b981` | Pozitív delta, "befejezve" állapot |
| `bad` | `#ef4444` | Negatív delta, "kijelentkezés", hiba |

> Akcent narancs használat: csak primary CTA-ra, aktív állapotra, és egyetlen vizuális fókuszpontra képernyőnként. **Ne** színezz be több elemet egyszerre narancsra — a vizuális hierarchia ezen áll.

### Tipográfia

- **Display / UI**: `Manrope` (Google Font, weight 400/500/600/700/800)
- **Mono / számok**: `JetBrains Mono` (weight 500/600/700)

Számértékeknél (testsúly, idő, súly, ismétlés, BMI, delta, stb.) **mindig** JetBrains Mono — ez a rendszer egyik tartóoszlopa.

#### Type scale

| Szerep | Méret | Weight | Letter-spacing | Példa |
|---|---|---|---|---|
| H1 nagy szám (BMI, jelenlegi metrika) | 42 / 32 px | 700 (mono) | -1.5 / -0.8 | „17 /21", „84.2 kg" |
| Page title | 30 px | 800 | -0.6 | „Mérések", „Fejlődés" |
| Greeting | 28 px | 800 | -0.5 | „Szia, Márton" |
| Exercise name | 26 px | 800 | -0.6 | „Kettlebell Snatch" |
| Stat tile value | 22 px | 700 (mono) | -0.5 | „84.2" |
| Card title | 16-17 px | 700-800 | -0.2 / -0.5 | „Snatch Test + Strength" |
| Body | 14 px | 500-600 | 0 | leíró szöveg |
| Caption / meta | 12-13 px | 500-600 | 0 | „48 perc · Tegnap" |
| Overline / label | 10.5-12 px | 600-700 | 1.0-1.4, **UPPERCASE** | „GYORS MŰVELETEK" |
| Mini stat value | 15 px | 700 (mono) | 0 | „4 280 kg" |

### Spacing

- Standard képernyő-horizontal padding: **20 px** (16 px form/active workout esetén)
- Kártya belső padding: **14-18 px**
- Vertikális elem-rés: **8-12 px** (sűrű) / **18-22 px** (szekciók között)
- Tab bar magasság: 8 px top + 22 px bottom safe-area + tartalom

### Radius

| Elem | Radius |
|---|---|
| Phone bezel | 38 px |
| Nagy CTA / Card | 12-16 px |
| Stat tile | 14 px |
| Input | 9-12 px |
| Ikon-kontainer (32-52 px box) | 8-12 px |
| Chip / pill | 999 px |
| Avatar | 999 px |

### Shadow

- **Primary CTA glow**: `0 8px 20px -8px rgba(249,115,22,0.6)` — csak narancs gombokon
- **Phone bezel** (canvas): `0 30px 60px -20px rgba(15,23,42,0.55), 0 0 0 1px rgba(15,23,42,0.18)` — produkciós alkalmazásban irreleváns

### Ikonok

Outline + filled variánsok, Ionicons-stílusú, 1.7 px stroke, 24 px viewBox. A `screens.jsx` `I` objektumban minden ikon definíciója megtalálható (home, kettlebell, pulse, trendUp, person, scale, drop, target, flame, clock, ruler, bolt, play, pause, check, chevR/L, plus, more, edit, close, arrowU/D).

**Javaslat produkcióhoz:** használjatok bevett ikon-könyvtárat (Ionicons, Phosphor, Lucide) — a megfelelő párokat (outline / filled) ott megtaláljátok. Tab bar aktív állapotban filled, inaktív outline.

---

## Architecture & Routes

A prototípus 7 fő nézetet tartalmaz, ebből 5 a fő tab navigációban él:

```
Tab bar (alul, mindig látható kivéve modal képernyőkön):
├── Dashboard       (home)
├── Edzések         (kettlebell)
├── Mérések         (pulse)
├── Fejlődés        (trendUp)
└── Profil          (person)

Modal / push:
├── Testkompo mérés (Mérések → "Új mérés" gomb)
└── Aktív edzés     (Edzések → "Edzés indítása" / Dashboard → "Edzés indítása")
```

Az aktív edzés és a testkompo form **teljes képernyős modal**-ként viselkedik — nincs tab bar, csak vissza/bezár gomb a bal felső sarokban.

---

## Screens

### 1. Dashboard (`dashboard`)

**Cél**: napi indító képernyő. A sportoló egy pillantással lássa az állapotát és tudja elindítani a mai edzést.

**Felépítés (fentről le):**

1. **Greeting blokk**
   - Felül kis, halvány dátum: `Csütörtök, máj. 21` (textMute, 13 px, weight 600)
   - Cím: `Szia, [Név]` + emoji (👊 — opcionális, helyettesíthető natív ikonnal)
   - Alatta motiváló sor: `Készen állsz a 12. hétre?` (textDim, 14 px)

2. **Stat row** — 3 oszlopos grid (`StatTile` komponens):
   - Testsúly · kg · delta (lefelé jó)
   - Testzsír · % · delta (lefelé jó)
   - FMS · /21 · delta (felfelé jó)
   - Minden tile: ikon (narancs) fent, nagy mono szám középen (22 px), label + delta chip alul (10.5 px mono, zöld/piros nyíllal)
   - Delta szín: szemantikus — lefogyni jó → lefelé delta zöld; izom/FMS növekedni jó → felfelé delta zöld

3. **Legutóbbi edzés kártya** (`Card`)
   - Bal: 52×52 narancs-soft ikon-box kettlebell ikonnal
   - Középen: edzés neve + meta (idő · dátum, clock ikonnal)
   - Alatta border-top alatt 3 oszlopos mini stat: Volume / Szettek / Ismétlés (mono számok)

4. **Gyors műveletek** — 2 oszlopos grid:
   - Bal (primary): teljes narancs hátterű gomb, "Edzés indítása" → `active`
   - Jobb (secondary): card hátterű, "Mérés felvétele" → `bodycomp`
   - Mindkettő: kis ikon-box fent, cím + felirat alul. Magasság 96 px.

### 2. Edzések (`workouts`)

**Cél**: heti program áttekintése + ma esedékes edzés gyors indítása.

**Felépítés:**

1. **TabHeader**: `Heti terv · 4 / 8` (subtitle) + `Edzések` (title)

2. **Mai edzés nagy kártya** — `accent` borderrel:
   - „MA" pill (narancs) + „B nap" overline
   - Edzés neve (22 px, weight 800)
   - Leírás (textDim, 13 px)
   - Meta sor monóban: óra + szett szám (clock & kettlebell ikon)
   - Alatta teljes szélességű narancs CTA: `▶ Edzés indítása` → `active`

3. **Heti program lista** — 4 nap (A / B / C / D), mindegyik egy `Card`:
   - 40×40 nap-jel doboz (A/B/C/D betűkkel; ha kész → zöld check ikon; ha ma → narancs filled)
   - Cím + státusz · időtartam
   - Chevron jobbra

### 3. Mérések (`measure`)

**Cél**: két fő mérés típus (FMS, testkompo) áttekintése + új bejegyzés indítása + előzmény-lista.

**Felépítés:**

1. **TabHeader**: `Áttekintés` / `Mérések`

2. **FMS nagy kártya** (`BigMeasureCard`)
   - Fent: ikon + cím + dátum
   - Középen: nagy mono szám (42 px) „17 /21" + státusz badge (JÓ, zöld outline pill)
   - Alul: narancs CTA „Új felmérés"

3. **Testkompo nagy kártya** (`BigMeasureCard` rows variánsa)
   - Fent: ikon + cím + dátum
   - 2 oszlopos grid 4 sorral: Testsúly, Testzsír, Izomtömeg, BMI (címke balra, mono érték jobbra egy sorban)
   - Alul: narancs CTA „Új mérés" → `bodycomp`

4. **Előzmények kártya** — szekvenciális lista borderTop elválasztókkal:
   - Bal: 36×36 ikon-box (FMS → target, testkompo → scale)
   - Cím + dátum
   - Jobb oldal: érték mono fontban + chevron

### 4. Testkompo form (`bodycomp`)

**Cél**: új testkompo mérés rögzítése. Modal, nincs tab bar.

**Felépítés:**

1. **Header bar**: bal vissza-gomb (chev-left, 36×36 card box) + overline („Új bejegyzés") + cím („Testkompo mérés")

2. **Form mezők (`Field` komponens)**:
   - Testsúly (kg)
   - Testzsír (%)
   - Izomtömeg (kg)
   - **2 oszlopos sor**: Zsigeri zsír (idx) | Csontmass (kg) — compact variant
   - Testvíz (%)
   - Minden mező: label fent (12.5 px textMute), majd dark input (background `bg`, border `border`) — mono szám + unit jobb oldalt

3. **BMI auto kártya** — narancs-soft háttér, narancs border:
   - Bal: overline „BMI (AUTO)" (narancs) + „Magasság: 182 cm" (textDim)
   - Jobb: nagy mono szám (28 px), számítva: `weight / (height_m)²`

4. **Megjegyzés textarea** — 3 sor, placeholder „Hogy érezted magad? Mit változtatnál?"

5. **Mentés CTA** — teljes szélességű narancs gomb, narancs glow shadow

### 5. Fejlődés (`progress`)

**Cél**: idősoros vizualizáció + delta összegző. Metrika és időszak váltható.

**Felépítés:**

1. **TabHeader**: `Időszak` / `Fejlődés`

2. **Időszak chipek** (pill, 999 radius): `1 hó / 3 hó / 6 hó / 1 év` — kiválasztott narancs, többi card

3. **Metrika tabok** (egyenlően osztott, 10 px radius): `Testsúly / Testzsír / FMS` — kiválasztott narancs-soft háttér + narancs border + narancs szöveg

4. **Chart kártya**
   - Bal felül: „JELENLEG" overline + nagy mono érték (32 px) + unit
   - Jobb felül: delta badge (`DeltaBadge`) — színes pill, nyíl + abszolút + százalék delta
   - Chart:
     - **Vonal chart** (testsúly, testzsír): SVG path + gradient area fill, halvány gridvonalak (dashed), utolsó pontot kiemelve (külső halo + belső fehér pont)
     - **Bar chart** (FMS): SVG rect oszlopok, utolsó oszlop teli narancs, többi narancs-32% opacity
   - Alul X-tengely címkék (mono, 10.5 px): FEB / MÁR / ÁPR / MÁJ

5. **Összefoglaló — utolsó 3 hónap** szekció, 4 db `DeltaRow` kártya:
   - Bal: metrika neve + first→last (mono)
   - Jobb: delta nyíllal és színnel

### 6. Aktív edzés logger (`active`)

**Cél**: edzés közben szettek logolása. Modal, nincs tab bar.

**Felépítés:**

1. **Header bar**
   - Bal: bezárás (X)
   - Középen: futó **timer pill** — pulzáló narancs pötty + mono mm:ss; kattintással szünet/folytatás (`running` toggle)
   - Jobb: 3-dot menü
   - Alatta overline: edzés neve · nap

2. **Progress dots** — 4 (gyakorlat szám) egyenlően osztott sávra:
   - Kész gyakorlatok: zöld
   - Aktuális: narancs
   - Hátralévő: borderSoft

3. **Gyakorlat fejléc**
   - Felül: „GYAKORLAT 1 / 4" (narancs overline) | „2 / 4 SZETT" (mono textMute)
   - Cím: gyakorlat neve (26 px, weight 800)
   - Leírás (13.5 px textDim) — súly · ismétlés · oldalankénti megjegyzés

4. **Set logger táblázat** (`SetRow` ismétlés)
   - Fejléc grid: `# | Reps | Súly (kg) | ✓` (32px / 1fr / 1fr / 44px)
   - Soronként:
     - Sor szám (mono)
     - Reps input (mono, középre, placeholder = target.reps)
     - Súly input (mono, középre, placeholder = target.weight)
     - Check gomb (34×34): bekapcsolva zöld háttér + fehér pipa; kikapcsolva üres pipa szürke kerettel
   - Bekapcsolt szett: zöld-soft háttér + zöld border + zöld szín

5. **Következő gyakorlat / Edzés befejezése** gomb
   - Disabled (60% opacity, card háttér, szürke szöveg), amíg nem minden szett kész
   - Enabled: narancs + glow
   - Utolsó gyakorlatnál a felirat „Edzés befejezése"

### 7. Profil (`profile`)

**Cél**: felhasználói adatok + beállítások menü.

**Felépítés:**

1. **TabHeader**: `Sportoló` / `Márton K.`

2. **Profil kártya**
   - Avatar (58×58 kör, narancs gradient háttér, monogram „MK" fehéren)
   - Név + meta („Underground KB · 12. hét")
   - Jobbra: „Szerkeszt" gomb
   - Alul border-top alatt 3 oszlop: Magasság / Életkor / Edzések — mono szám + uppercase overline

3. **Beállítások lista** (`Card` padding 0, sorok közt borderTop)
   - Edzés terv
   - Edző hozzárendelése
   - Értesítések
   - Mértékegységek
   - Adatkezelés
   - Kijelentkezés (piros, chevron nélkül)

---

## State Management

Minimális, lokális state — a prototípus React `useState`-tel kezeli. Produkciós megvalósításhoz javaslat:

| Domain | State / data |
|---|---|
| Auth / user | Profil adatok (név, magasság, életkor) |
| Workouts | Heti program (4-7 nap), mai esedékes nap, befejezett edzések logja |
| Active workout session | Időmérő, aktuális gyakorlat indexe, szettenkénti `{reps, weight, done}` |
| Measurements | Testkompo és FMS bejegyzések időbélyeggel |
| Progress charts | Származtatva a measurements idősorából + edzés volume idősorából |

Backend perzisztencia minimum: user, workouts, workout_sessions, measurements, fms_assessments táblák. Időmérő futása csak kliensoldalon, ne küldjétek minden tick-et.

## Interactions

- **Tab váltás**: instant, ikon outline → filled, szín textMute → accent narancs
- **Gomb hover** (web)/press (mobile): natív platform feedback
- **Aktív edzés timer**: 1 mp-enként frissül; pause/resume gomb
- **Set check**: állapot toggle, sor háttere átkapcsol zöldre 150 ms-os transition-nel
- **Form mentés**: csak vizuálisan navigál vissza — backend POST után navigate
- **Pulzáló timer pötty**: 1.4s ease-in-out végtelen `opacity 1 → 0.35 → 1`

## Felelős state-ek aktív edzésen

- `exIdx` — aktuális gyakorlat index (0-tól)
- `sets` — `[[{reps, weight, done}, …]]` 2D tömb, `sets[exIdx][setIdx]`
- `elapsed` — másodperc, mono formátum `mm:ss`
- `running` — boolean, timer fut-e

A „Következő gyakorlat" gomb csak akkor enabled, ha minden szett `done`. Az utolsó gyakorlatnál „Edzés befejezése" feliratot kap és visszaviszi a felhasználót a workouts képernyőre.

---

## Tartalom (másolás / copy)

Az alkalmazás **magyar nyelvű**. A prototípusban szereplő összes szöveg végleges, ahol nincs más megjelölés. Ide tartoznak:

- Tab címek: `Dashboard / Edzések / Mérések / Fejlődés / Profil`
- CTA-k: `Edzés indítása / Új mérés / Új felmérés / Mentés / Következő gyakorlat / Edzés befejezése`
- Üres mező placeholderek: lásd a `Field` és `SetRow` komponenseket
- Státusz pillek: `MA / JÓ / Befejezve / Ma esedékes / Várakozik`

Nevek, számok, dátumok demo-adatok — éles adattal helyettesítendők.

---

## Files

| Fájl | Tartalom |
|---|---|
| `Underground KB Mobile.html` | Belépési pont. A `DesignCanvas`-on belül mind a 7 képernyőt megjeleníti egymás mellett iPhone bezelben. |
| `screens.jsx` | **Az összes UI komponens, design token (`T` objektum) és ikon (`I` objektum).** Ez a referencia-igazság. |
| `design-canvas.jsx` | Csak a prototípus-bemutató kanavász (pan/zoom + artboardok). **Produkciós kód szempontjából irreleváns.** |
| `ios-frame.jsx` | iOS bezel komponens — referencia, hogy hogyan néz ki a státuszsor + home indicator. Produkcióban a célplatform natív chromejára támaszkodjatok. |
| `screenshots/` | PNG referenciák mind a 7 képernyőről (lásd lent). |

## Screenshots

A `screenshots/` mappa a 7 fő nézetet tartalmazza azonos sorrendben, mint a Screens szekció fent:

| Fájl | Képernyő |
|---|---|
| `01-dashboard.png` | Dashboard (kezdőképernyő, stat tiles, gyors műveletek) |
| `02-workouts.png` | Edzések (mai edzés kártya + heti program) |
| `03-measure.png` | Mérések (FMS + testkompo kártyák + előzmények) |
| `04-bodycomp-form.png` | Testkompo mérés űrlap (modal) |
| `05-progress.png` | Fejlődés (chart + delta összesítő) |
| `06-active-workout.png` | Aktív edzés logger (modal, szettenkénti rögzítés) |
| `07-profile.png` | Profil + beállítások menü |

## Mit nézzetek meg először

1. **`screens.jsx`** — a `T` (tokens) és `I` (icons) objektumokat a fájl tetején, majd minden képernyő-komponenst (Dashboard, MeasureTab, BodyCompForm, ProgressTab, WorkoutsTab, ActiveWorkout, ProfileTab).
2. Nyissátok meg az `Underground KB Mobile.html` fájlt böngészőben — interaktív, kattintható, minden képernyőt látni egymás mellett.
3. A komponenseket emeljétek át a célplatform stílusrendszerébe — ne másoljátok az inline stílusokat 1:1-ben; használjatok stíluskategóriákat (StyleSheet, Tailwind, NativeStyles, Modifier-láncok, stb.) a célkörnyezet konvenciói szerint.

## Mit *ne* csináljatok

- Ne másoljátok 1:1-ben az inline `style={...}` blokkokat — token-alapú stylinget használjatok.
- Ne hozzatok be új színt a fenti palettán kívül.
- Ne adjatok hozzá új ikonokat / képernyőket egyeztetés nélkül.
- Ne keverjetek light mode-ot ide — az app **dark-only**, legalább v1-ben.
- Ne pótoljátok ki üres helyeket "filler" tartalommal.

---

## Open questions for follow-up

- Onboarding flow (regisztráció, magasság/cél bekérése) — nem szerepel a v1-ben.
- Edzéstervező / coach-felület — csak hivatkozva (Profil → „Edzés terv", „Edző hozzárendelése").
- Notifikációk: push payload és formátum.
- Mértékegység-váltás (kg ↔ lb) — placeholder, nincs UI specifikáció.
- Offline / sync logika edzés közben.

Kérdés esetén forduljatok a tervezőhöz.
