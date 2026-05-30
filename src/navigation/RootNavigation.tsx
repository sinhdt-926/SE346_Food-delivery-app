import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { supabase } from "../services/supabase";
import { useAuthStore } from "../store/useAuthStore";

import AuthStack from "./AuthStack";
import CustomerStack from "./CustomerStack";
import OwnerStack from "./OwnerStack";

export default function RootNavigation() {
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  // Lấy role từ bảng users
  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      console.log("role error:", error);
      return;
    }

    if (data) {
      console.log("role:", data.role);
      setRole(data.role);
    }
  };

  useEffect(() => {
    // 1. Kiểm tra session ngay khi mở app
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        await fetchUserRole(session.user.id);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // 2. Lắng nghe auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);

      if (event === "USER_UPDATED") {
        console.log("USER_UPDATED event - skipping navigation re-render");
        return;
      }

      if (session?.user) {
        setUser(session.user);
        // Chỉ fetch role khi sign in/sign up, không phải mỗi lần update
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          await fetchUserRole(session.user.id);
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Màn hình loading khi đang check token
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#181C2E",
        }}
      >
        <ActivityIndicator size="large" color="#FF7622" />
      </View>
    );
  }

  // Chưa đăng nhập
  if (!user) {
    return <AuthStack />;
  }

  // Owner
  if (role === "owner") {
    return <OwnerStack />;
  }

  // Customer
  return <CustomerStack />;
}
