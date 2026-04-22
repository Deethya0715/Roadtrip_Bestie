import "./global.css";
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-perryTeal">
      <Text className="text-jakeYellow text-3xl font-bold mb-4">
        Roadtrip Bestie
      </Text>
      <Text className="text-white text-base mb-6">
        NativeWind is wired up!
      </Text>

      <View className="bg-slytherinEmerald px-6 py-3 rounded-2xl mb-3">
        <Text className="text-white font-semibold">slytherinEmerald card</Text>
      </View>

      <View className="bg-meanGirlsPink px-6 py-3 rounded-2xl mb-3">
        <Text className="text-white font-semibold">meanGirlsPink card</Text>
      </View>

      <View className="bg-laLaPeach px-6 py-3 rounded-2xl">
        <Text className="text-slytherinEmerald font-semibold">laLaPeach card</Text>
      </View>

      <StatusBar style="light" />
    </View>
  );
}
