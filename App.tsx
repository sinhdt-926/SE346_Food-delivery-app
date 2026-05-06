// import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import TestApp from "./src/TestApp";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TestApp />
    </GestureHandlerRootView>
  );
}
