import { AuthContext } from "@/context/AuthProvider";
import { Credencial } from "@/model/types";
import { router } from "expo-router";
import { useContext, useState } from "react";
import { Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const requiredMessage = "Campo obrigatório";

const schema = yup
  .object()
  .shape({
    email: yup.string
      .required(requiredMessage)
      .matches(/\S+@\S+\.\S+/, "Email inválido"),
    senha: yup.string
      .required(requiredMessage)
      .matches(
        /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{8,}$/,
        "A senha deve conter ao menos uma letra maiúscula, uma letra minúscula, um númeral, um caractere especial e um total de 8 caracteres",
      ),
  })
  .required();

export default function Entrar() {
  const { signIn } = useContext<any>(AuthContext);
  const theme = useTheme();
  const {
    constrol,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      email: "",
      senha: "",
    },
    mode: "onSubmit",
    resolver: yupResolver(schema),
  });

  const [exibirSenha, setExibirSenha] = useState(true);
  const [logando, setLogando] = useState(false);
  const [dialogVisivel, setDialogVisivel] = useState(false);
  const [mensagemDialog, setMensagemDialog] = useState("");

  async function entrar(data: Credencial) {
    setLogando(true);
    const resposta = await signIn(data);
    if (resposta === "OK") {
      router.replace("/(tabs)/home");
    } else {
      setMensagemDialog(resposta);
      setDialogVisivel(true);
    }
    setLogando(false);
  }
  return (
    <SafeAreaView
      style={{ ...styles.container, backgroundColor: theme.colors.background }}
    >
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <>
          <Image style={styles.image} source={require("../assets/images/")} />
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.textinput}
                label="Email"
                placeholder="Digite seu email"
                mode="outlined"
                autoCapitalize="none"
                returnKeyType="next"
                keyboardType="email-address"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                right={<TextInput.Icon icon="email" />}
              />
            )}
            name="email"
          />
          {errors.email && (
            <Text style={{ ...styles.textError, color: theme.colors.error }}>
              {errors.email?.message?.toString()}
            </Text>
          )}
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.textinput}
                label="Senha"
                placeholder="Digite sua senha"
                mode="outlined"
                autoCapitalize="none"
                returnKeyType="go"
                secureTextEntry={exibirSenha}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                right={
                  <TextInput.Icon
                    icon="eye"
                    color={
                      exibirSenha
                        ? theme.colors.onBackground
                        : theme.colors.error
                    }
                    onPress={() => setExibirSenha((previus) => !previus)}
                  />
                }
              />
            )}
            name="senha"
          />
          {errors.senha && (
            <Text style={{ ...styles.textError, color: theme.colors.error }}>
              {errors.senha?.message?.toString()}
            </Text>
          )}
          <Text
            style={{
              ...styles.textEsqueceuSenha,
              color: theme.colors.tertiary,
            }}
            variant="labelMedium"
            onPress={() => router.push("/recuperarSenha")}
          >
            Esqueceu sua senha?
          </Text>
          <Button
            style={styles.button}
            mode="contained"
            onPress={handleSubmit(entrar)}
            loading={logando}
            disabled={logando}
          >
            {!logando ? "Entrar" : "Entrando"}
          </Button>
          <Divider />
          <View style={styles.divCadastro}>
            <Text variant="labelMedium">Não tem uma conta?</Text>
            <Text
              style={{ ...styles.textCadastro, color: theme.colors.tertiary }}
              variant="labelMedium"
              onPress={() => router.push("/cadastrar")}
            >
              {" "}
              Cadastre-se.
            </Text>
          </View>
        </>
      </ScrollView>
    </SafeAreaView>
  );
}
