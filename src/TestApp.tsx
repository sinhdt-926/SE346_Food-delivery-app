import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import OwnerTabs from "./navigation/OwnerTabs";

export default function TestApp() {
  return (
    <NavigationContainer>
      <OwnerTabs />
    </NavigationContainer>
  );
}
