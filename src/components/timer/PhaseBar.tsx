import { View } from 'react-native';
import { INTRO_COLOR, COOLDOWN_COLOR } from '@/lib/intervalTimers';
import type { TimerConfig } from '@/lib/intervalTimers';

interface Props {
  config: TimerConfig;
  activePhaseIndex?: number;
}

export function PhaseBar({ config }: Props) {
  const segments: { color: string }[] = [
    { color: INTRO_COLOR },
    ...Array.from({ length: config.rounds }).flatMap(() => [
      { color: config.work_color },
      ...(config.rest_sec > 0 ? [{ color: config.rest_color }] : []),
    ]),
    ...(config.cooldown_sec > 0 ? [{ color: COOLDOWN_COLOR }] : []),
  ];

  return (
    <View style={{ flexDirection: 'row', height: 5, gap: 2 }}>
      {segments.map((seg, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            backgroundColor: seg.color,
            borderRadius: 3,
            opacity: 0.85,
          }}
        />
      ))}
    </View>
  );
}
