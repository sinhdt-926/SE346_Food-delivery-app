import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const TabIcon = ({
  name,
  title,
  focused,
}: {
  name: any;
  title: string;
  focused: boolean;
}) => (
  <View
    style={{
      alignItems: "center",
      justifyContent: "center",
      width: 70,
    }}
  >
    <Ionicons name={name} size={24} color={focused ? "#FF7A1A" : "#999"} />

    <Text
      style={{
        fontSize: 9,
        marginTop: 2,
        color: focused ? "#FF7A1A" : "#999",
        fontWeight: focused ? "600" : "400",
        textAlign: "center",
      }}
    >
      {title}
    </Text>
  </View>
);
