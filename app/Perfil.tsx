import { UserContext } from "@/context/UserProvider";
import { Usuario } from "@/model/Usuario";
import { masks } from "@/utils/masks";
import { yupResolver } from "@hookform/resolvers/yup";
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
  })
  .required();

export default function Perfil({ navigation }: any) {
  const theme = useTheme();
  const { userFirebase } = useContext<Usuario>(UserContext);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      nome: userFirebase.nome,
      email: userFirebase.email,
      telefone: userFirebase.telefone,
      cpf: userFirebase.cpf,
      cnpj: userFirebase.cnpj,
    },
    mode: "onSubmit",
    resolver: yupResolver(schema),
  });

  const [requisitando, setRequisitando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [dialogErroVisivel, setDialogErroVisivel] = useState(false);
  const [dialogExcluirVisivel, setDialogExcluirVisivel] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: "", mensagem: "" });
  const { update, del } = useContext(UserContext);

  useEffect(() => {}, []);

  async function atualizarPerfil(data: Usuario) {
    setRequisitando(true);
    setAtualizando(true);
    data.uid = userFirebase.uid;
    data.urlFoto =
      "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50";
    const msg = await update(data);

    if (msg === "OK") {
      setMensagem({
        tipo: "OK",
        mensagem: "Seu perfil foi atualizado com sucesso.",
      });
      setDialogErroVisivel(true);
      setRequisitando(false);
      setAtualizando(false);
    } else {
      setMensagem({ tipo: "erro", mensagem: msg });
      setDialogErroVisivel(true);
      setRequisitando(false);
      setAtualizando(false);
    }
  }

  function avisarDaExclusaoPermanenteDaConta() {
    setDialogExcluirVisivel(true);
  }

  async function excluirConta() {
    setDialogExcluirVisivel(false);
    setRequisitando(true);
    setExcluindo(true);
    const msg = await del(userFirebase.uid);
    if (msg === "OK") {
      router.replace("/signIn");
    } else {
      setMensagem({ tipo: "erro", mensagem: msg });
      setDialogErroVisivel(true);
      setRequisitando(false);
      setExcluindo(false);
    }
  }

  return (
    <SafeAreaView
      style={{ ...styles.container, backgroundColor: theme.colors.background }}
    >
      <ScrollView>
        <>
          <Image
            style={styles.image}
            source={require("../assets/images/shoal/icon-user.png")}
            loadingIndicatorSource={require("../assets/images/shoal/icon-user.png")}
          />
          <View style={styles.divButtonsImage}>
            <Button
              style={styles.buttonImage}
              mode="outlined"
              icon="image"
              onPress={() => alert("Em desenvolvimento")}
            >
              Galeria
            </Button>
            <Button
              style={styles.buttonImage}
              mode="outlined"
              icon="camera"
              onPress={() => alert("Em desenvolvimento")}
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
                placeholder="Digite seu nome"
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
                disabled
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
                right={<TextInput.Icon icon="phone" />}
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
          <Button
            style={styles.button}
            mode="contained"
            onPress={handleSubmit(atualizarPerfil)}
            loading={requisitando}
            disabled={requisitando}
          >
            {!atualizando ? "Atualizar" : "Atualizando"}
          </Button>
          <Button
            style={styles.buttonOthers}
            mode="outlined"
            onPress={handleSubmit(avisarDaExclusaoPermanenteDaConta)}
            loading={requisitando}
            disabled={requisitando}
          >
            {!excluindo ? "Excluir" : "Excluindo"}
          </Button>
        </>
      </ScrollView>
      <Dialog
        visible={dialogExcluirVisivel}
        onDismiss={() => {
          setDialogErroVisivel(false);
        }}
      >
        <Dialog.Icon icon={"alert-circle-outline"} size={60} />
        <Dialog.Title style={styles.textDialog}>{"Ops!"}</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.textDialog} variant="bodyLarge">
            {
              "Você tem certeza que deseja excluir sua conta?\nEsta operação será irreversível."
            }
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDialogExcluirVisivel(false)}>
            Cancelar
          </Button>
          <Button onPress={excluirConta}>Excluir</Button>
        </Dialog.Actions>
      </Dialog>
      <Dialog
        visible={dialogErroVisivel}
        onDismiss={() => {
          setDialogErroVisivel(false);
          if (mensagem.tipo === "OK") {
            router.back();
          }
        }}
      >
        <Dialog.Icon
          icon={
            mensagem.tipo === "OK"
              ? "checkbox-marked-circle-outline"
              : "alert-circle-outline"
          }
          size={60}
        />
        <Dialog.Title style={styles.textDialog}>
          {mensagem.tipo === "OK" ? "Informação" : "Erro"}
        </Dialog.Title>
        <Dialog.Content>
          <Text style={styles.textDialog} variant="bodyLarge">
            {mensagem.mensagem}
          </Text>
        </Dialog.Content>
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
    marginTop: 40,
  },
  buttonOthers: {
    marginTop: 20,
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
