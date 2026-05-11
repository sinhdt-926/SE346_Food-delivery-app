import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface Props {
  type: "fastfood" | "dessert" | "drink";
  name: string;
  id: string;
  price: string;
  image?: string;
  onPress?: () => void;
}
