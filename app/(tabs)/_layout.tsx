import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, focused }: { name: IoniconsName; focused: boolean }) {
  return (
    <Ionicons
      name={focused ? name : (`${name}-outline` as IoniconsName)}
      size={24}
      color={focused ? '#f97316' : '#64748b'}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e2a3f',
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 16,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: '600', letterSpacing: 0.2 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Edzések',
          tabBarIcon: ({ focused }) => <TabIcon name="fitness" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="measurements"
        options={{
          title: 'Mérések',
          tabBarIcon: ({ focused }) => <TabIcon name="body" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Fejlődés',
          tabBarIcon: ({ focused }) => <TabIcon name="trending-up" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
