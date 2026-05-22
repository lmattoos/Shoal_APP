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

const schema = yup.object().shape({
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
});

export default function PeixariaUser() {
  const theme = useTheme();
  const { userAuth } = useContext<any>(AuthContext);
  const { peixariaUser, updatePeixaria, delPeixaria } =
    useContext<any>(PeixariaContext);
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
      nome: peixariaUser?.nome,
      email: peixariaUser?.email,
      telefone: peixariaUser?.telefone,
      cpf: peixariaUser?.cpf,
      cnpj: peixariaUser?.cnpj,
      descricao: peixariaUser?.descricao,
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
  const [urlDevice, setUrlDevice] = useState("");

  async function updPeixaria(formData: any) {
    setRequisitando(true);
    setAtualizando(true);
    const peixariaAtualizada: Peixaria = {
      uid: peixariaUser.uid,
      ownerId: peixariaUser.ownerId,
      urlFoto: peixariaUser.urlFoto,
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      cpf: formData.cpf,
      cnpj: formData.cnpj,
      descricao: formData.descricao,
    };

    const msg = await updatePeixaria(peixariaAtualizada, urlDevice);

    if (msg === "OK") {
      setMensagem({
        tipo: "OK",
        mensagem: "Sua peixaria foi atualizada com sucesso.",
      });
      setUrlDevice("");
      setDialogErroVisivel(true);
    } else {
      setMensagem({ tipo: "erro", mensagem: msg });
      setDialogErroVisivel(true);
    }
    setRequisitando(false);
    setAtualizando(false);
  }

  function avisarDaExclusaoPermanenteDaPeixaria() {
    setDialogExcluirVisivel(true);
  }

  async function excluirPeixaria() {
    setDialogExcluirVisivel(false);
    setRequisitando(true);
    setExcluindo(true);

    const msg = await delPeixaria(peixariaUser.uid, peixariaUser.ownerId);

    if (msg === "OK") {
      setRequisitando(false);
      setExcluindo(false);
    } else {
      setMensagem({ tipo: "erro", mensagem: msg });
      setDialogErroVisivel(true);
      setRequisitando(false);
      setExcluindo(false);
    }
  }

  async function buscarNaGaleria() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
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
      aspect: [4, 3],
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
      {userAuth && peixariaUser ? (
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
                  : { uri: peixariaUser?.urlFoto }
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
              onPress={handleSubmit(updPeixaria)}
              loading={requisitando && atualizando}
              disabled={requisitando}
            >
              {!atualizando ? "Atualizar" : "Atualizando"}
            </Button>
            <Button
              style={styles.buttonOthers}
              mode="outlined"
              onPress={avisarDaExclusaoPermanenteDaPeixaria}
              loading={requisitando && excluindo}
              disabled={requisitando}
            >
              {!excluindo ? "Excluir Peixaria" : "Excluindo"}
            </Button>
          </>
        </ScrollView>
      ) : (
        <></>
      )}
      <Dialog
        visible={dialogExcluirVisivel}
        onDismiss={() => setDialogExcluirVisivel(false)}
      >
        <Dialog.Icon icon="alert-circle-outline" size={60} />
        <Dialog.Title style={styles.textDialog}>Atenção</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.textDialog} variant="bodyLarge">
            {
              "Você tem certeza que deseja excluir sua peixaria?\nEsta operação será irreversível."
            }
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDialogExcluirVisivel(false)}>
            Cancelar
          </Button>
          <Button onPress={excluirPeixaria}>Excluir</Button>
        </Dialog.Actions>
      </Dialog>
      <Dialog
        visible={dialogErroVisivel}
        onDismiss={() => setDialogErroVisivel(false)}
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
        <Dialog.Actions>
          <Button onPress={() => setDialogErroVisivel(false)}>Fechar</Button>
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
