import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { toastConfig } from "./src/components/Notification";
import RootNavigation from "./src/navigation/RootNavigation";

export default function App() {
  return (
    <>
      <NavigationContainer>
        <RootNavigation />
      </NavigationContainer>
      <Toast config={toastConfig} />
      <StatusBar style="light" />
    </>
  );
}
