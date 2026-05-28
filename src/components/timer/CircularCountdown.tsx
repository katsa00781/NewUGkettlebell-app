import { View, Text } from 'react-native';
import { formatTimerTime } from '@/lib/intervalTimers';

interface Props {
  secondsLeft: number;
  color: string;
  size?: number;
}

export function CircularCountdown({ secondsLeft, color, size = 220 }: Props) {
  const ringWidth = 7;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: ringWidth,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.45,
        shadowRadius: 20,
        elevation: 10,
      }}
    >
      <Text
        style={{
          color: '#fff',
          fontSize: 58,
          fontWeight: '800',
          letterSpacing: -1,
          fontVariant: ['tabular-nums'],
        }}
      >
        {formatTimerTime(secondsLeft)}
      </Text>
    </View>
  );
}
