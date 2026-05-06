import React from "react";

import { View, Text, StyleSheet, ScrollView } from "react-native";

import BackButton from "../../components/BackButton";

import ProfileButton from "../../components/ProfileButton";

export default function OwnerProfileScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <BackButton />

        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* PROFILE + SETTINGS */}
      <View style={styles.cardGroup}>
        <ProfileButton
          title="Personal Info"
          iconName="person-outline"
          iconColor="#FF7A1A"
          onPress={() => console.log("Personal Info")}
        />

        <ProfileButton
          title="Settings"
          iconName="settings-outline"
          iconColor="#5B5BFF"
          onPress={() => console.log("Settings")}
        />
      </View>

      {/* HISTORY + ORDERS */}
      <View style={styles.cardGroup}>
        <ProfileButton
          title="Withdrawal History"
          iconName="card-outline"
          iconColor="#FF9B52"
          onPress={() => console.log("Withdrawal")}
        />

        <ProfileButton
          title="Number of Orders"
          iconName="receipt-outline"
          iconColor="#25C3F3"
          onPress={() => console.log("Orders")}
        />
      </View>

      {/* REVIEWS */}
      <View style={styles.cardGroup}>
        <ProfileButton
          title="User Reviews"
          iconName="chatbubble-outline"
          iconColor="#21D4C4"
          onPress={() => console.log("Reviews")}
        />
      </View>

      {/* LOGOUT */}
      <View style={styles.cardGroup}>
        <ProfileButton
          title="Log Out"
          iconName="log-out-outline"
          iconColor="#FF4B4B"
          onPress={() => console.log("Logout")}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#F8F8F8",

    paddingTop: 65,

    paddingHorizontal: 24,
  },

  header: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 30,
  },

  headerTitle: {
    marginLeft: 18,

    fontSize: 24,

    fontWeight: "600",

    color: "#222",
  },

  cardGroup: {
    backgroundColor: "#F2F2F2",

    borderRadius: 24,

    overflow: "hidden",

    marginBottom: 22,
  },
});
