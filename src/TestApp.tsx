import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import OwnerTabs from "./navigation/OwnerTabs";
import OwnerStack from "./navigation/OwnerStack";

export default function TestApp() {
  return (
    <NavigationContainer>
      <OwnerStack />
    </NavigationContainer>
  );
}
