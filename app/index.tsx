import { AuthContext } from "@/context/AuthProvider";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useContext, useEffect } from "react";
import { Image, Platform, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Preload() {
  const theme = useTheme();
  const { signIn, recuperaCredencialdaCache } = useContext<any>(AuthContext);

  async function logar() {
    const credencial = await recuperaCredencialdaCache();
    if (credencial) {
      const resposta = await signIn(credencial);
      if (resposta === "OK") {
        const lastNotification =
          await Notifications.getLastNotificationResponseAsync();
        switch (lastNotification?.notification.request.content.data.rota) {
          case "rota":
            router.replace("/(tabs)/rota");
            break;
          case "rota":
            router.replace("/(tabs)/rota");
            break;
          default:
            router.replace("/(tabs)/rotaPadrao");
        }
      } else {
        router.replace("/entrar");
      }
    }
  }

  useEffect(() => {
    logar();
    registerForPushNotificationsAsync();
  }, []);

  async function registerForPushNotificationsAsync(): Promise<void> {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: theme.colors.error,
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        handleRegistrationError(
          "Permissão negada. Você não receberá notificações até que a permissão seja concedida.",
        );
        return;
      }
    }
  }

  function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
  }

  return (
    <View
      style={{ ...styles.container, backgroundColor: theme.colors.background }}
    >
      <Image
        style={styles.imagem}
        source={require("../assets/images/shoal/Shoal(Logo).png")}
        accessibilityLabel="logo do app"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imagem: {
    width: 250,
    height: 250,
  },
});
