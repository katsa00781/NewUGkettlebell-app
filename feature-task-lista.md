# Feature Task Lista – Underground KB Mobile

## Refaktor / Cleanup (először ezeket)

- [ ] **Tab struktúra átírása** – `appointments` tab törlése, új tabok: `measurements`, `progress`
- [ ] **Planner törlése** – `app/(tabs)/workouts/planner.tsx` + `workoutStore.ts` planner state kivétele
- [ ] **Appointments törlése** – `app/(tabs)/appointments/`, `src/hooks/useAppointments.ts`, `src/lib/appointments.ts`
- [ ] **Dashboard frissítése** – appointments referenciák eltávolítása, quick actions frissítése

---

## Phase 1 – Testkompo mérések

### Adatbázis
- [ ] `user_measurements` tábla létrehozása Supabase-ben (SQL migration)
- [ ] RLS policy: user csak saját adatait látja/írja
- [ ] `src/types/supabase.ts` bővítése `user_measurements` típussal

### Backend / lib
- [ ] `src/lib/measurements.ts` – getMeasurements, addMeasurement, deleteMeasurement
- [ ] `src/hooks/useMeasurements.ts` – useUserMeasurements, useAddMeasurement, useDeleteMeasurement

### UI
- [ ] `app/(tabs)/measurements/` mappa + `_layout.tsx`
- [ ] `app/(tabs)/measurements/index.tsx` – tab főoldal: FMS kártya + testkompo kártya, utolsó értékek
- [ ] `app/(tabs)/measurements/body.tsx` – testkompo form (weight, body_fat_pct, muscle_mass_kg, visceral_fat, bmi auto, body_water_pct, bone_mass_kg, notes)
- [ ] `app/(tabs)/measurements/fms.tsx` – a meglévő `profile/fms.tsx` áthelyezve ide
- [ ] `src/components/measurements/MeasurementCard.tsx` – egy mérés összefoglaló kártya
- [ ] BMI automatikus számítás (weight / height² – height a profilból)

---

## Phase 2 – Progress / Fejlődés vizualizáció

### UI
- [ ] `app/(tabs)/progress/` mappa + `_layout.tsx`
- [ ] `app/(tabs)/progress/index.tsx` – tab főoldal: időszak választó (1h, 3h, 6h, 1év)
- [ ] `src/components/charts/WeightChart.tsx` – testsúly trend (LineChart)
- [ ] `src/components/charts/BodyFatChart.tsx` – testzsír% trend (LineChart)
- [ ] `src/components/charts/MuscleMassChart.tsx` – izomtömeg trend (LineChart)
- [ ] `src/components/charts/FMSChart.tsx` – FMS total score trend (BarChart)
- [ ] `src/components/charts/BodyCompositionSummary.tsx` – összefoglaló kártyák (első vs. utolsó mérés delta)
- [ ] Grafikon szín és stílus egységesítése (orange primary, kék secondary, zöld pozitív változás)

---

## Phase 3 – Edzésterv nézet (webes appból)

### Előkészítés
- [ ] Egyeztetés: melyik Supabase tábla tartalmazza a webes app edzéstervét (workout_plans? training_plans?)
- [ ] `src/types/supabase.ts` bővítése a tervtábla típusával
- [ ] `src/lib/workoutPlans.ts` – getUserWorkoutPlan (aktuális/aktív terv lekérése)
- [ ] `src/hooks/useWorkoutPlan.ts` – useCurrentWorkoutPlan

### UI
- [ ] `app/(tabs)/workouts/plan.tsx` – aktív edzésterv nézet (heti bontás, napok, gyakorlatok)
- [ ] `src/components/workout/WorkoutPlanDay.tsx` – egy nap a tervből
- [ ] `src/components/workout/WorkoutPlanExercise.tsx` – egy gyakorlat a tervből (olvasható, nem szerkeszthető)
- [ ] Empty state: ha nincs aktív terv, link a webes apphoz

---

## Phase 4 – Workout Logger

### Adatbázis
- [ ] `workout_logs` tábla létrehozása Supabase-ben
- [ ] RLS policy beállítása
- [ ] `src/types/supabase.ts` bővítése

### Backend / lib
- [ ] `src/lib/workoutLog.ts` – startWorkoutLog, updateWorkoutLog, finishWorkoutLog, getWorkoutLogs
- [ ] `src/hooks/useWorkoutLog.ts` – useStartWorkout, useLogSet, useFinishWorkout, useWorkoutHistory

### State
- [ ] `src/stores/workoutLogStore.ts` – aktív edzés state (currentWorkout, completedSets, elapsedTime)

### UI
- [ ] `app/(tabs)/workouts/index.tsx` – Workouts tab főoldal: Aktív terv + Edzés indítása gomb + history
- [ ] `app/(tabs)/workouts/active.tsx` – aktív edzés képernyő (szett igazolás, rep/súly input, timer)
- [ ] `src/components/workout/SetLogger.tsx` – egy szett rögzítő komponens
- [ ] `src/components/workout/ExerciseLogger.tsx` – egy gyakorlat összes szett-je
- [ ] `src/components/workout/WorkoutTimer.tsx` – pihenő timer
- [ ] `src/components/workout/WorkoutSummary.tsx` – befejezett edzés összefoglaló

---

## Phase 5 – Dashboard frissítés

- [ ] Legutóbbi testkompo mérés widget
- [ ] Legutóbbi FMS score widget
- [ ] Következő tervezett edzésnap (edzéstervből)
- [ ] Gyors műveletek: Mérés felvétele, Edzés indítása
- [ ] Quick stats: testsúly változás (utolsó 30 nap), FMS trend

---

## Ship előtt

- [ ] iOS és Android tesztelés Expo Go-ban
- [ ] Teljes flow tesztelés: bejelentkezés → mérés → grafikon → edzés indítás → log → summary
- [ ] Edge case-ek: üres állapotok (nincs mérés, nincs terv), hálózati hiba
- [ ] Lint + typecheck hibák nélkül (`npx tsc --noEmit`)
- [ ] Console.log-ok eltávolítása
- [ ] EAS Build production binary tesztelése

---

## Javasolt sorrend

```
1. Cleanup (appointments + planner törlés)
2. Phase 1 – Mérések (legnagyobb érték, legegyszerűbb)
3. Phase 2 – Grafikonok (gifted-charts már telepítve)
4. Phase 5 – Dashboard frissítés
5. Phase 3 – Edzésterv nézet (webes app sémától függ)
6. Phase 4 – Workout Logger (legkomplexebb)
```
