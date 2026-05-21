# Underground KB Mobile – Backlog / Jelenlegi állapot

> Frissítsd ezt a fájlt minden befejezett feladat után!
> Dátum: 2026-05-21

---

## Jelenlegi állapot: P2 KÉSZ – P3 következik

### ✅ Kész és működik

| Funkció | Fájlok |
|---------|--------|
| Auth (login, register, session) | `app/auth/`, `src/hooks/useAuth.ts`, `src/stores/authStore.ts` |
| Tab navigáció (4 tab: Dashboard, Edzések, Mérések, Profil) | `app/(tabs)/_layout.tsx` |
| Dashboard alap (edzések, súly, FMS stat, gyors műveletek) | `app/(tabs)/dashboard.tsx` |
| Gyakorlatok böngészése + részletek | `app/(tabs)/exercises/`, `src/hooks/useExercises.ts`, `src/lib/exercises.ts` |
| FMS felmérés (rögzítés + history) – **áthelyezve Mérések tabba** | `app/(tabs)/measurements/fms.tsx`, `src/hooks/useFMS.ts`, `src/lib/fms.ts` |
| Testsúly napló (rögzítés + history) | `app/(tabs)/profile/progress.tsx`, `src/hooks/useProgress.ts`, `src/lib/weights.ts` |
| Profil szerkesztés | `app/(tabs)/profile/index.tsx` |
| Workout lista + részletek | `app/(tabs)/workouts/`, `src/hooks/useWorkouts.ts`, `src/lib/workouts.ts` |
| Admin panel (users – alapszint) | `app/admin/` |
| Supabase séma + típusok | `src/types/supabase.ts` |
| Zustand store-ok | `src/stores/authStore.ts`, `src/stores/workoutStore.ts` |
| **P0 – Cleanup kész** | Appointments tab + hooks + lib törölve; planner + create + workoutGenerator törölve; workoutStore cleanup kész |
| **P1 – Testkompo mérések** | `src/lib/measurements.ts`, `src/hooks/useMeasurements.ts`, `app/(tabs)/measurements/` (index + body + fms), `src/components/measurements/MeasurementCard.tsx`, BMI auto-számítás profil magasság alapján |
| **P2 – Progress grafikonok** | `app/(tabs)/progress/_layout.tsx` + `index.tsx`; Progress tab a `_layout.tsx`-be; időszak választó (1/3/6 hó, összes); delta kártyák; LineChart (testsúly, testzsír%, izomtömeg); BarChart (FMS pontszám) |

---

### 🔨 Folyamatban / Következő

**P3 – Dashboard frissítés** – ez a következő lépés.

---

## Backlog (prioritás szerint)

### P3 – Dashboard frissítés

- [ ] Legutóbbi testkompo widget (`useLatestMeasurement` – hook már megvan)
- [ ] Gyors műveletek frissítése (Testkompo mérés → `/(tabs)/measurements/body`, FMS → `/(tabs)/measurements/fms`)
- [ ] Quick stats kártya (30 napos súlyváltozás, testzsír% változás)

### P4 – Edzésterv nézet

- [ ] ⚠️ Egyeztetés szükséges: melyik Supabase tábla a webes app edzésterve?
- [ ] Terv lekérése + nézet (csak olvasás)
- [ ] Empty state ha nincs aktív terv

### P5 – Workout Logger

- [ ] `workout_logs` típus bővítése `src/types/supabase.ts`-be
- [ ] `src/lib/workoutLog.ts` + `src/hooks/useWorkoutLog.ts`
- [ ] `src/stores/measurementStore.ts` → átnevezni/bővíteni: `workoutLogStore.ts`
- [ ] Aktív edzés képernyő (szett/rep/súly igazolás)
- [ ] Pihenő timer
- [ ] Edzés összefoglaló

---

## Ismert problémák / Nyitott kérdések

| # | Kérdés | Státusz |
|---|--------|---------|
| 1 | Melyik Supabase tábla tárolja a webes app edzéstervét? | ❓ Nyitott – P4 előtt kell dönteni |
| 2 | Dashboard „Gyors műveletek" még régi route-okra (profile/progress, profile/fms) mutat – frissíteni kell P3-ban | ⚠️ P3-ban javítandó |
| 3 | Progress tab hozzáadva a `_layout.tsx`-be | ✅ Kész |

---

## Hogyan frissítsd ezt a fájlt

Amikor befejezesz egy feladatot:

1. Mozgasd át ✅ Kész és működik szekcióba
2. Frissítsd a Backlog-ot (vedd ki a kész itemet)
3. Ha új probléma/kérdés merül fel, add hozzá az Ismert problémák táblához
4. Frissítsd a dátumot a fejlécben
