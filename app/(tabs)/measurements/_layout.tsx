import { Stack } from 'expo-router';

export default function MeasurementsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="body" />
      <Stack.Screen name="fms" />
    </Stack>
  );
}
