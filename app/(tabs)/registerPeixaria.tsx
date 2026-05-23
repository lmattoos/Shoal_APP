import { AuthContext } from "@/context/AuthProvider";
import { PeixariaContext } from "@/context/PeixariaProvider";
import { Peixaria } from "@/model/Peixaria";
import { masks } from "@/utils/masks";
import { yupResolver } from "@hookform/resolvers/yup";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Button, Dialog, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";

const requiredMessage = "Campo obrigatório";

const schema = yup
  .object()
  .shape({
    nome: yup.string().required(requiredMessage),
    email: yup
      .string()
      .required(requiredMessage)
      .matches(/\S+@\S+\.\S+/, "Email inválido"),
    telefone: yup
      .string()
      .required(requiredMessage)
      .matches(/^\(\d{2}\) \d{5}\-\d{4}$/, "Telefone inválido"),
    cpf: yup
      .string()
      .required(requiredMessage)
      .matches(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/, "CPF inválido"),
    cnpj: yup
      .string()
      .required(requiredMessage)
      .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/, "CNPJ inválido"),
    descricao: yup
      .string()
      .max(150, "A descrição deve ter no máximo 150 caracteres"),
  })
  .required();

export default function RegPeixaria() {
  const theme = useTheme();
  const { userAuth } = useContext<any>(AuthContext);
  const { registerPeixaria } = useContext<any>(PeixariaContext);
  const [authDialogVisivel, setAuthDialogVisivel] = useState(false);

  useEffect(() => {
    if (!userAuth) {
      setAuthDialogVisivel(true);
    }
  }, [userAuth]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      cpf: "",
      cnpj: "",
      descricao: "",
    },
    mode: "onSubmit",
    resolver: yupResolver(schema),
  });

  const [requisitando, setRequisitando] = useState(false);
  const [dialogVisivel, setDialogVisivel] = useState(false);
  const [dialogImagemVisivel, setDialogImagemVisivel] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: "", mensagem: "" });
  const [urlDevice, setUrlDevice] = useState("");

  async function cadPeixaria(data: Peixaria) {
    if (urlDevice === "") {
      setDialogImagemVisivel(true);
      return;
    }

    setRequisitando(true);
    const msg = await registerPeixaria(userAuth?.user?.uid, data, urlDevice);
    if (msg === "OK") {
      setRequisitando(false);
      router.replace("/(tabs)/peixariaUser");
    } else {
      setMensagem({ tipo: "erro", mensagem: msg });
      setDialogVisivel(true);
      setRequisitando(false);
    }
  }

  async function buscarNaGaleria() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setUrlDevice(result.assets[0].uri);
    }
  }

  async function tirarFoto() {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setUrlDevice(result.assets[0].uri);
    }
  }

  return (
    <SafeAreaView
      style={{ ...styles.container, backgroundColor: theme.colors.background }}
    >
      {userAuth ? (
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <>
            <Image
              style={styles.image}
              source={
                urlDevice !== ""
                  ? { uri: urlDevice }
                  : {
                      uri: "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50",
                    }
              }
            />
            <View style={styles.divButtonsImage}>
              <Button
                style={styles.buttonImage}
                mode="outlined"
                icon="image"
                onPress={buscarNaGaleria}
              >
                Galeria
              </Button>
              <Button
                style={styles.buttonImage}
                mode="outlined"
                icon="camera"
                onPress={tirarFoto}
              >
                Foto
              </Button>
            </View>
            <Controller
              control={control}
              name="nome"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.textinput}
                  label="Nome"
                  placeholder="Digite o nome da sua peixaria"
                  mode="outlined"
                  autoCapitalize="words"
                  returnKeyType="next"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  right={<TextInput.Icon icon="smart-card" />}
                />
              )}
            />
            {errors.nome && (
              <Text style={{ ...styles.textError, color: theme.colors.error }}>
                {errors.nome?.message?.toString()}
              </Text>
            )}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.textinput}
                  label="E-mail"
                  placeholder="Digite seu e-mail"
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
            />
            {errors.email && (
              <Text style={{ ...styles.textError, color: theme.colors.error }}>
                {errors.email?.message?.toString()}
              </Text>
            )}
            <Controller
              control={control}
              name="telefone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.textinput}
                  label="Telefone"
                  placeholder="(00) 00000-0000"
                  mode="outlined"
                  keyboardType="phone-pad"
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(masks.telefone(text))}
                  value={value}
                />
              )}
            />
            {errors.telefone && (
              <Text style={{ ...styles.textError, color: theme.colors.error }}>
                {errors.telefone?.message?.toString()}
              </Text>
            )}
            <Controller
              control={control}
              name="cpf"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.textinput}
                  label="CPF"
                  placeholder="000.000.000-00"
                  mode="outlined"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(masks.cpf(text))}
                  value={value}
                  right={<TextInput.Icon icon="account-details" />}
                />
              )}
            />
            {errors.cpf && (
              <Text style={{ ...styles.textError, color: theme.colors.error }}>
                {errors.cpf?.message?.toString()}
              </Text>
            )}
            <Controller
              control={control}
              name="cnpj"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.textinput}
                  label="CNPJ"
                  placeholder="00.000.000/0001-00"
                  mode="outlined"
                  keyboardType="numeric"
                  returnKeyType="next"
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(masks.cnpj(text))}
                  value={value}
                  right={<TextInput.Icon icon="office-building" />}
                />
              )}
            />
            {errors.cnpj && (
              <Text style={{ ...styles.textError, color: theme.colors.error }}>
                {errors.cnpj?.message?.toString()}
              </Text>
            )}
            <Controller
              control={control}
              name="descricao"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.textinput}
                  label="Descrição (Opcional)"
                  mode="outlined"
                  multiline
                  maxLength={150}
                  returnKeyType="next"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  right={<TextInput.Icon icon="card-text-outline" />}
                />
              )}
            />
            {errors.descricao && (
              <Text style={{ ...styles.textError, color: theme.colors.error }}>
                {errors.descricao?.message?.toString()}
              </Text>
            )}
            <Button
              style={styles.button}
              mode="contained"
              onPress={handleSubmit(cadPeixaria)}
              loading={requisitando}
              disabled={requisitando}
            >
              {!requisitando ? "Cadastrar" : "Cadastrando"}
            </Button>
          </>
        </ScrollView>
      ) : (
        <></>
      )}

      <Dialog visible={dialogVisivel} onDismiss={() => setDialogVisivel(false)}>
        <Dialog.Icon icon="alert-circle-outline" size={60} />
        <Dialog.Title style={styles.textDialog}>Erro</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.textDialog} variant="bodyLarge">
            {mensagem.mensagem}
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDialogVisivel(false)}>Fechar</Button>
        </Dialog.Actions>
      </Dialog>

      <Dialog
        visible={dialogImagemVisivel}
        onDismiss={() => setDialogImagemVisivel(false)}
      >
        <Dialog.Icon
          icon="image-off-outline"
          size={60}
          color={theme.colors.error}
        />
        <Dialog.Title style={styles.textDialog}>Foto Obrigatória</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.textDialog} variant="bodyLarge">
            {
              "Para poder cadastrar sua peixaria, é necessário enviar uma imagem da logo ou fachada do estabelecimento."
            }
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDialogImagemVisivel(false)}>
            Entendido
          </Button>
        </Dialog.Actions>
      </Dialog>

      <Dialog visible={authDialogVisivel} dismissable={false}>
        <Dialog.Icon
          icon="account-lock-outline"
          size={60}
          color={theme.colors.error}
        />
        <Dialog.Title style={styles.textDialog}>
          Autenticação Necessária
        </Dialog.Title>
        <Dialog.Content>
          <Text style={styles.textDialog} variant="bodyLarge">
            {
              "Para poder cadastrar uma peixaria no Shoal, você precisa possuir uma conta ativa no sistema."
            }
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            onPress={() => {
              setAuthDialogVisivel(false);
              router.push("/signUp");
            }}
          >
            Cadastrar-se
          </Button>
          <Button
            onPress={() => {
              setAuthDialogVisivel(false);
              router.back();
            }}
          >
            Voltar
          </Button>
        </Dialog.Actions>
      </Dialog>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: "center",
    borderRadius: 200 / 2,
    marginTop: 50,
  },
  textinput: {
    width: 350,
    height: 50,
    marginTop: 20,
    backgroundColor: "transparent",
  },
  textEsqueceuSenha: {
    alignSelf: "flex-end",
    marginTop: 20,
  },
  textCadastro: {},
  textError: {
    width: 350,
  },
  button: {
    marginTop: 50,
    marginBottom: 30,
  },
  divButtonsImage: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
    marginBottom: 20,
  },
  buttonImage: {
    width: 180,
  },
  textDialog: {
    textAlign: "center",
  },
});
