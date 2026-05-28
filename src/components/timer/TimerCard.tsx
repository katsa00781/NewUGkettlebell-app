import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PhaseBar } from './PhaseBar';
import { formatTimerTime, getTotalSec, INTRO_COLOR } from '@/lib/intervalTimers';
import type { TimerConfig } from '@/lib/intervalTimers';

interface Props {
  config: TimerConfig;
  isFactory?: boolean;
  onPlay: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
}

export function TimerCard({ config, isFactory, onPlay, onCopy, onDelete }: Props) {
  const totalSec = getTotalSec(config);
  const playColor = config.work_color;

  return (
    <View
      style={{
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1e2a3f',
      }}
    >
      {/* Header sor */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        {/* Ikon */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: playColor + '22',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name="timer-outline" size={20} color={playColor} />
        </View>

        {/* Név + összefoglaló */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <Text style={{ color: '#f1f5f9', fontSize: 15, fontWeight: '700' }}>
              {config.name}
            </Text>
            {isFactory && (
              <View
                style={{
                  backgroundColor: '#334155',
                  borderRadius: 5,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ color: '#94a3b8', fontSize: 9, fontWeight: '700', letterSpacing: 0.8 }}>
                  GYÁRI
                </Text>
              </View>
            )}
          </View>
          <Text style={{ color: '#64748b', fontSize: 12 }}>
            {config.rounds}× · {formatTimerTime(config.work_sec)}
            {config.rest_sec > 0 ? ` / ${formatTimerTime(config.rest_sec)}` : ''}
            {' · össz '}
            <Text style={{ color: '#94a3b8' }}>{formatTimerTime(totalSec)}</Text>
          </Text>
        </View>

        {/* Play gomb */}
        <TouchableOpacity
          onPress={onPlay}
          activeOpacity={0.8}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: playColor,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="play" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Fázis csíkok */}
      <PhaseBar config={config} />

      {/* Alsó akció sor */}
      <View style={{ flexDirection: 'row', marginTop: 10, gap: 16 }}>
        {isFactory && onCopy && (
          <TouchableOpacity onPress={onCopy} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Ionicons name="copy-outline" size={14} color="#64748b" />
            <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600' }}>Másolás</Text>
          </TouchableOpacity>
        )}
        {!isFactory && onDelete && (
          <TouchableOpacity onPress={onDelete} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Ionicons name="trash-outline" size={14} color="#ef4444" />
            <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>Törlés</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
