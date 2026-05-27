import { PescadoContext } from "@/context/PescadoProvider";
import { Pescado } from "@/model/Pescado";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Avatar,
  Card,
  Chip,
  FAB,
  IconButton,
  List,
  Searchbar,
  useTheme,
} from "react-native-paper";

const CATEGORIAS = [
  "Todos",
  "Filés",
  "Peixes Inteiros",
  "Porções e Postas",
  "Camarão",
  "Frutos do Mar",
  "Congelados",
];

export default function GerenciarPescados() {
  const theme = useTheme();
  const { pescadosCatalogo, getPescadosPeixaria } =
    useContext<any>(PescadoContext);
  const [searchQueryState, setSearchQuery] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");
  const [pescadosSearch, setPescadosSearch] = useState<Pescado[]>([]);

  useEffect(() => {
    getPescadosPeixaria();
  }, []);

  useEffect(() => {
    executarBuscaCombinada(searchQueryState, categoriaSelecionada);
  }, [searchQueryState, categoriaSelecionada, pescadosCatalogo]);

  function executarBuscaCombinada(texto: string, categoria: string) {
    if (!pescadosCatalogo) {
      return;
    }

    if (texto === "" && categoria === "Todos") {
      setPescadosSearch([]);
      return;
    }

    let resultado = [...pescadosCatalogo];

    if (categoria !== "Todos") {
      resultado = resultado.filter(
        (p) => p.categoria.toLowerCase() === categoria.toLowerCase(),
      );
    }

    if (texto !== "") {
      resultado = resultado.filter((p) =>
        p.nome.toLowerCase().includes(texto.toLowerCase()),
      );
    }

    setPescadosSearch(resultado);
  }

  function clearSearch() {
    setSearchQuery("");
    setCategoriaSelecionada("Todos");
    setPescadosSearch([]);
  }

  async function irParaEdicao(pescado: Pescado) {
    router.push({
      pathname: "/editarPescado",
      params: { pescado: encodeURIComponent(JSON.stringify(pescado)) },
    });
    clearSearch();
  }

  async function irParaRegisterPescado() {
    router.push("/registerPescado");
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ ...styles.container, backgroundColor: theme.colors.background }}
    >
      <List.Section style={styles.list}>
        <List.Subheader style={styles.subheader}>Catálogo</List.Subheader>
        <Searchbar
          style={{
            ...styles.searchBar,
            backgroundColor: theme.colors.background,
          }}
          onChangeText={(query) => setSearchQuery(query)}
          onClearIconPress={clearSearch}
          value={searchQueryState}
          placeholder="Buscar pescado..."
        />
        <View style={styles.divCategorias}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIAS.map((cat, key) => (
              <Chip
                key={key}
                style={styles.chip}
                selected={categoriaSelecionada === cat}
                onPress={() => setCategoriaSelecionada(cat)}
                mode="outlined"
              >
                {cat}
              </Chip>
            ))}
          </ScrollView>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {pescadosSearch.length > 0
            ? pescadosSearch.map((pescado: Pescado, key: number) => (
                <Card
                  key={key}
                  style={{
                    ...styles.card,
                    borderColor: theme.colors.secondary,
                  }}
                >
                  <Card.Title
                    title={pescado.nome}
                    subtitle={`R$ ${pescado.valor_unidade} • ${pescado.peso_unidade}`}
                    left={() => (
                      <Avatar.Image
                        size={40}
                        source={{ uri: pescado.urlFoto }}
                      />
                    )}
                    right={() => (
                      <IconButton
                        icon="pencil"
                        iconColor={theme.colors.primary}
                        size={24}
                        onPress={() => irParaEdicao(pescado)}
                      />
                    )}
                  />
                </Card>
              ))
            : pescadosCatalogo &&
              pescadosCatalogo.map((pescado: Pescado, key: number) => (
                <Card
                  key={key}
                  style={{
                    ...styles.card,
                    borderColor: theme.colors.secondary,
                  }}
                >
                  <Card.Title
                    title={pescado.nome}
                    subtitle={`R$ ${pescado.valor_unidade} • ${pescado.peso_unidade}`}
                    left={() => (
                      <Avatar.Image
                        size={40}
                        source={{ uri: pescado.urlFoto }}
                      />
                    )}
                    right={() => (
                      <IconButton
                        icon="pencil"
                        iconColor={theme.colors.primary}
                        size={24}
                        onPress={() => irParaEdicao(pescado)}
                      />
                    )}
                  />
                </Card>
              ))}
        </ScrollView>
      </List.Section>
      <FAB icon="plus" style={styles.fab} onPress={irParaRegisterPescado} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  subheader: {
    fontSize: 20,
    alignSelf: "center",
  },
  list: {
    width: "95%",
    flex: 1,
  },
  searchBar: {
    marginBottom: 10,
    borderWidth: 1,
  },
  divCategorias: {
    flexDirection: "row",
    marginBottom: 20,
    marginTop: 10,
    height: 40,
  },
  chip: {
    marginRight: 8,
  },
  card: {
    height: 100,
    width: "100%",
    borderWidth: 1,
    marginBottom: 10,
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
