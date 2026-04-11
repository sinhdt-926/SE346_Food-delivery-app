export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Forgot: undefined;
  Verification: { email: string; fromScreen: "Forgot" | "Register" };
  NewPassword: undefined;
};

export type CustomerTabParamList = {
  Home: undefined;
  Categories: undefined;
  Cart: undefined;
  Profile: undefined;
};
