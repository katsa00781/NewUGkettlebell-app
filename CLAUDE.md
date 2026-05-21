# Underground KB Mobile – CLAUDE.md

## Szerepkör
Te egy tapasztalt Expo és React Native mérnök vagy, aki segít megépíteni az Underground KB mobilalkalmazást.
Írj tiszta, egyszerű, karbantartható kódot. A világosságot előnyben részesítsd a felesleges absztrakciókkal szemben.
Minden promptom elején olvasd el ezt a fájlt és kövesd szigorúan.
**Kommunikálj magyarul.**

---

## Projekt áttekintés

**Underground KB Mobile** – Companion mobilalkalmazás az Underground KB webes edzőplatformhoz.

A mobil app szerepe:
- Testkompo és FMS mérések felvétele terepen (edzés közben, mobilon)
- A webes appban létrehozott edzésterv megtekintése (csak olvasás)
- Aktív edzés közbeni workout logging (szett / rep / súly igazolás)
- Fejlődés vizualizációja grafikonon (testkompo trendek)

A webes app (undergrounkb) kezeli az edzéstervezést, gyakorlatkezelést és admin funkciókat.
A mobil app **nem szerkeszt, csak olvas** edzésterveket.

---

## Tech stack

- **Framework**: Expo ~54.0 + React Native 0.81.5
- **Nyelv**: TypeScript (strict mode)
- **Routing**: Expo Router ~6.0 (file-based)
- **Styling**: NativeWind ^4.2 (Tailwind szintaxis)
- **State**: Zustand ^5.0
- **Server state**: TanStack Query ^5.99
- **Auth + DB**: Supabase (@supabase/supabase-js ^2.104)
- **Perzisztencia**: AsyncStorage ^2.2
- **Grafikonok**: react-native-gifted-charts ^1.4 (már telepítve)
- **Ikonok**: @expo/vector-icons ^15.1 (Ionicons)
- **Dátum**: date-fns ^4.1

Új könyvtárat ne adj hozzá engedély nélkül. Ha indokolt lenne, javasold és kérdezz rá.

---

## Mappastruktúra

```
app/
  (tabs)/
    dashboard.tsx          ✅ megvan – megtartjuk, leegyszerűsítjük
    workouts/              🔨 átalakuló – csak logger + terv nézet
    measurements/          🆕 új tab – FMS + testkompo mérések
    progress/              🆕 új tab – grafikonok, trendek
    profile/               ✅ megvan – megtartjuk
  auth/                    ✅ megvan
  admin/                   ✅ megvan – nem fejlesztjük tovább
  index.tsx                ✅ megvan

src/
  hooks/
    useAuth.ts             ✅
    useWorkouts.ts         ✅
    useExercises.ts        ✅
    useFMS.ts              ✅
    useProgress.ts         ✅ – bővítjük testkompo mezőkkel
    useMeasurements.ts     🆕 – testkompo mérések hookja
    useWorkoutLog.ts       🆕 – aktív edzés logging hookja
  lib/
    supabase.ts            ✅
    workouts.ts            ✅
    exercises.ts           ✅
    fms.ts                 ✅
    weights.ts             ✅ – bővítjük
    measurements.ts        🆕 – testkompo lib
    workoutLog.ts          🆕 – workout log lib
  stores/
    authStore.ts           ✅
    workoutStore.ts        🔨 – planner részt kivesszük, logger state marad
    measurementStore.ts    🆕 – aktív mérési session state
  types/
    supabase.ts            ✅ – bővítjük új táblákkal
  components/
    charts/                🆕 – progress grafikonok
    measurements/          🆕 – mérési form komponensek
    workout/               🆕 – logger UI komponensek
  constants/
    images.ts              (ha szükséges)
```

**app/** – csak route-ok és képernyők, üzleti logika nélkül
**src/hooks/** – minden Supabase/TanStack Query hívás itt van
**src/lib/** – pure async függvények, Supabase query-k
**src/stores/** – Zustand store-ok, UI state
**src/components/** – újrafelhasználható UI elemek

---

## Tab struktúra (végleges)

| Tab | Ikon | Tartalom |
|-----|------|----------|
| Dashboard | home | Napi összefoglaló, legutóbbi mérések, következő edzés |
| Edzések | fitness | Aktuális edzésterv (webes appból, csak olvasás) + Workout logger |
| Mérések | body | FMS felmérés + testkompo mérések felvétele |
| Fejlődés | trending-up | Testkompo trendek grafikonon |
| Profil | person | Személyes adatok, kijelentkezés |

**Törölt funkciók (ne implementálj, ne hivatkozz rájuk):**
- ❌ Edzéstervező / workout generator (`workouts/planner.tsx`)
- ❌ Időpontfoglalás (`appointments/` tab és minden kapcsolódó hook/lib)
- ❌ Admin panel fejlesztése

---

## Adatbázis séma – releváns táblák

### Meglévő táblák (Supabase)
```
profiles          – felhasználói adatok
exercises         – gyakorlatok (csak olvasás mobilon)
workouts          – edzések (user_id alapján)
fms_assessments   – FMS felmérések (megvan, működik)
user_weights      – testsúly napló (megvan, működik)
```

### Bővítendő / új táblák
```
user_measurements – testkompo mérések
  id, user_id, date, weight, body_fat_pct, muscle_mass_kg,
  visceral_fat, bmi, body_water_pct, bone_mass_kg, notes, created_at

workout_logs      – aktív edzés logging
  id, user_id, workout_id, date, started_at, finished_at,
  sections (JSON – elvégzett szett/rep/súly adatok), notes, created_at
```

A típusokat a `src/types/supabase.ts` fájlban kell bővíteni, mielőtt az adott feature-t implementálod.

---

## Testkompo mérőszámok (webes apppal egyező)

| Mező | Típus | Egység |
|------|-------|--------|
| weight | number | kg |
| body_fat_pct | number | % |
| muscle_mass_kg | number | kg |
| visceral_fat | number | index |
| bmi | number | számított |
| body_water_pct | number | % |
| bone_mass_kg | number | kg |

A BMI-t automatikusan számítjuk a testsúly és a profilban tárolt magasság alapján.

---

## Fejlesztési filozófia

Feature-by-feature építés. Minden feature esetén:

1. Olvasd el ezt a fájlt először
2. Azonosítsd az érintett fájlokat
3. Tartsd a változtatásokat fókuszáltan
4. Ne írj át nem érintett kódot
5. Kövesd a meglévő mintákat (useQuery/useMutation + lib függvény)
6. Győződj meg róla, hogy a feature end-to-end működik
7. Javítsd a lint és type hibákat befejezés előtt
8. **Frissítsd a `BACKLOG.md` fájlt** – mozgasd át a kész itemet a ✅ Kész szekcióba, vedd ki a Backlog listából, és frissítsd a dátumot

---

## Kódminták – kövesd ezeket

### Hook minta (TanStack Query)
```ts
// src/hooks/useMeasurements.ts
export function useUserMeasurements() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['measurements', user?.id],
    queryFn: () => getMeasurements(user!.id),
    enabled: !!user,
  });
}

export function useAddMeasurement() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: addMeasurement,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['measurements', user?.id] }),
  });
}
```

### Lib minta (Supabase)
```ts
// src/lib/measurements.ts
export async function getMeasurements(userId: string): Promise<UserMeasurement[]> {
  const { data, error } = await supabase
    .from('user_measurements')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}
```

### Screen minta
```tsx
// app/(tabs)/measurements/index.tsx
export default function MeasurementsScreen() {
  const { user } = useAuth();
  const { data, isLoading } = useUserMeasurements();
  // ...
  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      {/* tartalom */}
    </SafeAreaView>
  );
}
```

---

## Styling szabályok

- **Mindig NativeWind className** – StyleSheet csak ha className-mel nem megoldható
- **Dark theme alap**: `bg-slate-900` (háttér), `bg-slate-800` (kártyák), `bg-slate-700` (inputok)
- **Accent szín**: `#f97316` (orange-500) – minden CTA, aktív elem, ikon
- **Szöveg**: `text-white` (főcím), `text-slate-300` (szöveg), `text-slate-400` (másodlagos)
- **Kártya stílus**: `bg-slate-800 rounded-2xl p-4 mb-3`
- **Gomb stílus**: `bg-orange-500 rounded-xl py-3 items-center`

**StyleSheet kivételek (ne használj className-t):**
- SafeAreaView, KeyboardAvoidingView, Modal, Animated.View
- Platform-specifikus stílusok, dinamikus runtime értékek

---

## TypeScript szabályok

- Strict mode – minden fájlban
- `any` tiltott – használj `unknown` + type guard-ot ha szükséges
- Minden Supabase Row típust a `src/types/supabase.ts`-ből importálj
- Új tábla = új típus a supabase.ts-be, MIELŐTT implementálod

---

## Grafikon szabályok (gifted-charts)

```tsx
import { LineChart, BarChart } from 'react-native-gifted-charts';

// Mindig add meg a width-et (Dimensions.get('window').width - padding)
// Színek: '#f97316' (primary), '#3b82f6' (secondary), '#10b981' (positive)
// Háttér: transparent, labelColor: '#94a3b8'
```

---

## Döntési szabályok

- Ha valami nem egyértelmű, javasold a jobb megközelítést és kérdezz rá
- Ha új könyvtár segítene, indokold és kérdezz rá mielőtt hozzáadod
- Meglévő UI-t ne változtass meg engedély nélkül
- Ha a webes app sémájával kapcsolatban kérdés merül fel, kérdezz rá

---

## Titkok és biztonság

- `.env` változók csak `EXPO_PUBLIC_` prefixszel a kliensen
- Supabase anon key OK a kliensen, service key SOHA
- User adatokat mindig `user_id` alapján szűrj (RLS)

---

## Emlékeztető

**Minden feature előtt:**
- Olvasd el ezt a fájlt
- Kövesd szigorúan
- Tiszta, egyszerű kódot írj
- Meglévő mintákat kövesd

**Minden feature után:**
- Frissítsd a `BACKLOG.md` fájlt
- Kész item → ✅ Kész szekcióba (fájlnevekkel együtt)
- Vedd ki a Backlog listából
- Frissítsd a dátumot a `BACKLOG.md` fejlécében