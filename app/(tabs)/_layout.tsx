import { AuthContext } from "@/context/AuthProvider";
import { PeixariaContext } from "@/context/PeixariaProvider";
import { Tabs } from "expo-router";
import { useContext } from "react";
import { Platform } from "react-native";
import { Icon, useTheme } from "react-native-paper";

export default function TabLayout() {
  const theme = useTheme();
  const { userAuth } = useContext<any>(AuthContext);
  const { peixariaUser } = useContext<any>(PeixariaContext);

  const possuiPeixaria = userAuth && peixariaUser !== null;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: () => (
            <Icon
              source="account-group"
              color={theme.colors.primary}
              size={20}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="peixariaUser"
        options={{
          title: "Minha Peixaria",
          href: possuiPeixaria ? "/peixariaUser" : null,
          tabBarIcon: () => (
            <Icon source="store-cog" color={theme.colors.primary} size={20} />
          ),
        }}
      />
      <Tabs.Screen
        name="gerenciarPescados"
        options={{
          title: "Gerenciar Catálogo",
          href: possuiPeixaria ? "/gerenciarPescados" : null,
          tabBarIcon: () => (
            <Icon source="fish" color={theme.colors.primary} size={20} />
          ),
        }}
      />
      <Tabs.Screen
        name="registerPeixaria"
        options={{
          title: "Cadastre uma peixaria",
          href: !possuiPeixaria ? "/registerPeixaria" : null,
          tabBarIcon: () => (
            <Icon
              source="storefront-plus-outline"
              color={theme.colors.primary}
              size={20}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Conta",
          tabBarIcon: () => (
            <Icon source="account" color={theme.colors.primary} size={20} />
          ),
        }}
      />
      <Tabs.Screen
        name="editarPescado"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="registerPescado"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
