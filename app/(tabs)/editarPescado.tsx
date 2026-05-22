import { PescadoContext } from "@/context/PescadoProvider";
import { Pescado } from "@/model/Pescado";
import { yupResolver } from "@hookform/resolvers/yup";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Button,
  Dialog,
  Menu,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";

const requiredMessage = "Campo obrigatório";

const CATEGORIAS = [
  "Filés",
  "Peixes Inteiros",
  "Porções e Postas",
  "Camarão",
  "Frutos do Mar",
  "Congelados",
];

const schema = yup.object().shape({
  nome: yup.string().required(requiredMessage),
  peso_unidade: yup.string().required(requiredMessage),
  valor_unidade: yup.string().required(requiredMessage),
  estoque: yup.string().required(requiredMessage),
  categoria: yup.string().required(requiredMessage),
  descricao: yup
    .string()
    .max(150, "A descrição deve ter no máximo 150 caracteres"),
});

export default function EditarPescado() {
  const theme = useTheme();
  const { pescado } = useLocalSearchParams();
  const pescadoParam = JSON.parse(pescado.toString());
  const { updatePescado, delPescado } = useContext<any>(PescadoContext);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      nome: pescadoParam?.nome,
      peso_unidade: pescadoParam?.peso_unidade,
      valor_unidade: pescadoParam?.valor_unidade,
      estoque: pescadoParam?.estoque,
      categoria: pescadoParam?.categoria,
      descricao: pescadoParam?.descricao || "",
    },
    mode: "onSubmit",
    resolver: yupResolver(schema),
  });

  const [requisitando, setRequisitando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [dialogErroVisivel, setDialogErroVisivel] = useState(false);
  const [dialogExcluirVisivel, setDialogExcluirVisivel] = useState(false);
  const [menuVisivel, setMenuVisivel] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: "", mensagem: "" });
  const [urlDevice, setUrlDevice] = useState("");

  async function updPescado(data: Pescado) {
    setRequisitando(true);
    setAtualizando(true);

    data.uid = pescadoParam?.uid;
    data.urlFoto = urlDevice !== "" ? urlDevice : pescadoParam?.urlFoto;

    const msg = await updatePescado(data, urlDevice);

    if (msg === "OK") {
      setMensagem({
        tipo: "OK",
        mensagem: "Pescado atualizado com sucesso.",
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

  function avisarDaExclusaoPermanenteDoPescado() {
    setDialogExcluirVisivel(true);
  }

  async function excluirPescado() {
    setDialogExcluirVisivel(false);
    setRequisitando(true);
    setExcluindo(true);

    const msg = await delPescado(pescadoParam?.uid);
    if (msg === "OK") {
      setMensagem({
        tipo: "OK",
        mensagem: "Pescadi excluído",
      });
      setDialogErroVisivel(true);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          ...styles.container,
          backgroundColor: theme.colors.background,
        }}
      >
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
                  : pescadoParam?.urlFoto && pescadoParam?.urlFoto !== ""
                    ? { uri: pescadoParam.urlFoto }
                    : require("../assets/images/shoal/Shoal(Anchor-Logo).png")
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
                  right={<TextInput.Icon icon="fish" />}
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
              name="peso_unidade"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.textinput}
                  label="Peso por unidade(g)"
                  mode="outlined"
                  keyboardType="numeric"
                  returnKeyType="next"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  right={<TextInput.Icon icon="weight-gram" />}
                />
              )}
            />
            {errors.peso_unidade && (
              <Text style={{ ...styles.textError, color: theme.colors.error }}>
                {errors.peso_unidade?.message?.toString()}
              </Text>
            )}

            <Controller
              control={control}
              name="valor_unidade"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.textinput}
                  label="Preço"
                  mode="outlined"
                  keyboardType="numeric"
                  returnKeyType="next"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  right={<TextInput.Icon icon="currency-usd" />}
                />
              )}
            />
            {errors.valor_unidade && (
              <Text style={{ ...styles.textError, color: theme.colors.error }}>
                {errors.valor_unidade?.message?.toString()}
              </Text>
            )}

            <Controller
              control={control}
              name="estoque"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.textinput}
                  label="Em Estoque"
                  mode="outlined"
                  keyboardType="numeric"
                  returnKeyType="next"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  right={<TextInput.Icon icon="warehouse" />}
                />
              )}
            />
            {errors.estoque && (
              <Text style={{ ...styles.textError, color: theme.colors.error }}>
                {errors.estoque?.message?.toString()}
              </Text>
            )}
            <Controller
              control={control}
              name="categoria"
              render={({ field: { value } }) => (
                <Menu
                  visible={menuVisivel}
                  onDismiss={() => setMenuVisivel(false)}
                  anchor={
                    <TextInput
                      style={styles.textinput}
                      label="Categoria"
                      mode="outlined"
                      value={value}
                      editable={false}
                      right={
                        <TextInput.Icon
                          icon="menu-down"
                          onPress={() => setMenuVisivel(true)}
                        />
                      }
                    />
                  }
                >
                  {CATEGORIAS.map((cat, index) => (
                    <Menu.Item
                      key={index}
                      onPress={() => {
                        setValue("categoria", cat, { shouldValidate: true });
                        setMenuVisivel(false);
                      }}
                      title={cat}
                    />
                  ))}
                </Menu>
              )}
            />
            {errors.categoria && (
              <Text style={{ ...styles.textError, color: theme.colors.error }}>
                {errors.categoria?.message?.toString()}
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
              onPress={handleSubmit(updPescado)}
              loading={requisitando && atualizando}
              disabled={requisitando}
            >
              {!atualizando ? "Atualizar" : "Atualizando"}
            </Button>
            <Button
              style={styles.buttonOthers}
              mode="outlined"
              onPress={avisarDaExclusaoPermanenteDoPescado}
              loading={requisitando && excluindo}
              disabled={requisitando}
            >
              {!excluindo ? "Excluir Pescado" : "Excluindo"}
            </Button>
          </>
        </ScrollView>
        <Dialog
          visible={dialogExcluirVisivel}
          onDismiss={() => setDialogExcluirVisivel(false)}
        >
          <Dialog.Icon icon="alert-circle-outline" size={60} />
          <Dialog.Title style={styles.textDialog}>Atenção</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.textDialog} variant="bodyLarge">
              {
                "Você tem certeza que deseja excluir esse registro?\nEsta operação será irreversível."
              }
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={excluirPescado}>Excluir</Button>
            <Button onPress={() => setDialogExcluirVisivel(false)}>
              Cancelar
            </Button>
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
          <Dialog.Actions>
            <Button onPress={() => setDialogErroVisivel(false)}>Fechar</Button>
          </Dialog.Actions>
        </Dialog>
      </KeyboardAvoidingView>
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
    marginTop: 30,
  },
  textinput: {
    width: 350,
    marginTop: 15,
    backgroundColor: "transparent",
  },
  textError: {
    width: 350,
    marginTop: 5,
  },
  button: {
    marginTop: 40,
    width: 350,
    alignSelf: "center",
  },
  buttonOthers: {
    marginTop: 20,
    marginBottom: 30,
    width: 350,
    alignSelf: "center",
  },
  divButtonsImage: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
    marginBottom: 10,
  },
  buttonImage: {
    width: 170,
    marginHorizontal: 5,
  },
  textDialog: {
    textAlign: "center",
  },
});
