import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { supabase } from "../services/supabase";
import { useAuthStore } from "../store/useAuthStore";

import AuthStack from "./AuthStack";
import CustomerStack from "./CustomerStack";
import OwnerStack from "./OwnerStack";

export default function RootNavigation() {
  const { user, setUser, isRecoveringPassword, setIsRecoveringPassword } = useAuthStore();
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);

      if (event === "PASSWORD_RECOVERY") {
        console.log("PASSWORD_RECOVERY event - staying on AuthStack for NewPassword");
        setIsRecoveringPassword(true);
      }

      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        setIsRecoveringPassword(false);
      }

      if (event === "USER_UPDATED") {
        console.log("USER_UPDATED event - skipping navigation re-render");
        return;
      }

      if (session?.user) {
        setUser(session.user);
        // Chỉ fetch role khi app khởi động hoặc khi vừa đăng nhập (trước đó chưa có user)
        const currentUser = useAuthStore.getState().user;
        if (event === "INITIAL_SESSION" || (event === "SIGNED_IN" && !currentUser)) {
          setIsLoading(true);
          await fetchUserRole(session.user.id);
          setIsLoading(false);
        }
      } else {
        setUser(null);
        setRole(null);
        setIsLoading(false); //tắt loading nếu chưa đăng nhập
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

  // Chưa đăng nhập HOẶC đang trong quá trình đặt lại mật khẩu mới
  if (!user || isRecoveringPassword) {
    return <AuthStack />;
  }

  // Owner
  if (role === "owner") {
    return <OwnerStack />;
  }

  // Customer
  return <CustomerStack />;
}
