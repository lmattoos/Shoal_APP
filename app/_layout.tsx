import { AuthProvider } from "@/context/AuthProvider";
import { UserProvider } from "@/context/UserProvider";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import "react-native-reanimated";

const themeLight = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    white: "#ffffff",
    black: "#000000",
  },
};

const themeDark = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    white: "#ffffff",
    black: "#000000",
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <PaperProvider theme={colorScheme === "dark" ? themeDark : themeLight}>
      <AuthProvider>
        <UserProvider>
          <Stack
            initialRouteName="index"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="entrar" />
            <Stack.Screen name="signUp" />
          </Stack>
        </UserProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
