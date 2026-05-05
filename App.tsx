import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import TestScreen from "./src/screens/testscreen";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TestScreen />
    </GestureHandlerRootView>
  );
}
