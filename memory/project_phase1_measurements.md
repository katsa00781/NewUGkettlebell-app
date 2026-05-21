---
name: project-phase1-measurements
description: Phase 1 testkompo mérések feature implementálva – Supabase tábla, lib, hook, képernyők
metadata:
  type: project
---

Phase 1 – Testkomponens mérések feature kész (2026-05-21).

**Elvégzett munkák:**
- `user_measurements` tábla létrehozva Supabase-ben RLS policy-kkal (select/insert/delete saját adatok)
- `src/types/supabase.ts` bővítve `UserMeasurement` típussal
- `src/lib/measurements.ts` – getMeasurements, getLatestMeasurement, addMeasurement, deleteMeasurement
- `src/hooks/useMeasurements.ts` – useUserMeasurements, useLatestMeasurement, useAddMeasurement, useDeleteMeasurement
- `src/components/measurements/MeasurementCard.tsx` – összefoglaló kártya törlés funkcióval
- `app/(tabs)/measurements/` – _layout.tsx, index.tsx (FMS + testkompo kártyák), body.tsx (form + lista), fms.tsx (FMS felmérés)
- `app/(tabs)/_layout.tsx` – Mérések tab hozzáadva (body ikon), exercises tab elrejtve (href: null)

**Why:** Phase 1 a feature-task-lista.md szerint, testkompo + FMS mérések mobilon való felvételéhez.

**How to apply:** A következő phase (Fejlődés/Progress tab grafikonokkal) erre épít – a measurements adatokat useUserMeasurements hook adja.
