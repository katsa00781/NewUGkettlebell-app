import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const TIMER_COLORS = [
  '#f97316',
  '#ef4444',
  '#ec4899',
  '#14b8a6',
  '#8b5cf6',
  '#3b82f6',
  '#22c55e',
];

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: Props) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {TIMER_COLORS.map((color) => (
        <TouchableOpacity
          key={color}
          onPress={() => onChange(color)}
          activeOpacity={0.8}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: color,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: value === color ? 2.5 : 0,
            borderColor: '#fff',
          }}
        >
          {value === color && <Ionicons name="checkmark" size={20} color="#fff" />}
        </TouchableOpacity>
      ))}
    </View>
  );
}
