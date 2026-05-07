import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { toastConfig } from "./src/components/Notification";
import RootNavigation from "./src/navigation/RootNavigation";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <RootNavigation />
      </NavigationContainer>
      <Toast config={toastConfig} />
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import TestApp from "./src/TestApp";
// export default function App() {
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <TestApp />
//     </GestureHandlerRootView>
//   );
// }
