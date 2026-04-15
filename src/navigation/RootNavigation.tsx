import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { supabase } from "../services/supabase";

import AuthStack from "./AuthStack";
import CustomerTabs from "./CustomerTabs";

export default function RootNavigation() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Kiểm tra ngay khi vừa mở app lên xem có đăng nhập từ trước chưa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // 2. Lắng nghe mọi thay đổi (Khi bấm Login, SignUp, Verify OTP thành công, hoặc Đăng xuất)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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
  return session && session.user ? <CustomerTabs /> : <AuthStack />;
}
