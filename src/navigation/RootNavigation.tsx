import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { supabase } from "../services/supabase";

import AuthStack from "./AuthStack";
import CustomerTabs from "./CustomerTabs";
import OwnerTabs from "./OwnerTabs";
import OwnerStack from "./OwnerStack";

export default function RootNavigation() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [role, setRole] = useState<string | null>(null);

  //lấy role user
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
    // 1. Kiểm tra ngay khi vừa mở app lên xem có đăng nhập từ trước chưa
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);

      if (session?.user) {
        await fetchUserRole(session.user.id);
      }

      setIsLoading(false);
    });

    // 2. Lắng nghe mọi thay đổi (Khi bấm Login, SignUp, Verify OTP thành công, hoặc Đăng xuất)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      if (session?.user) {
        await fetchUserRole(session.user.id);
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Màn hình loading chớp qua 0.5s lúc đang check token
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
  // 3. QUYẾT ĐỊNH ĐIỀU HƯỚNG: Có session (đã đăng nhập) thì vào app chính, chưa thì ra màn hình Auth
  //Chưa login
  if (!session || !session.user) {
    return <AuthStack />;
  }
  //test
  console.log("ROOT OWNER STACK");
  // Owner
  //if (role === "owner") {
  return <OwnerStack />;
  //}

  // Customer
  return <CustomerTabs />;
}
