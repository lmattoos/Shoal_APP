import { firestore, storage } from "@/firebase/firebaseinit";
import { Pescado } from "@/model/Pescado";
import * as ImageManipulator from "expo-image-manipulator";
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { createContext, useContext, useState } from "react";
import { PeixariaContext } from "./PeixariaProvider";

export const PescadoContext = createContext({});

export const PescadoProvider = ({ children }: any) => {
  const { peixariaUser } = useContext<any>(PeixariaContext);
  const [pescadosCatalogo, setPescadosCatalogo] = useState<Pescado[]>([]);

  async function getPescadosPeixaria(): Promise<void> {
    try {
      if (!peixariaUser?.uid) {
        return;
      }

      const q = query(
        collection(firestore, "pescados"),
        where("peixariaId", "==", peixariaUser.uid),
      );

      const querySnapshot = await getDocs(q);
      const listaPescados: Pescado[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        listaPescados.push({
          uid: docSnap.id,
          nome: data.nome,
          urlFoto: data.urlFoto,
          peso_unidade: data.peso_unidade,
          valor_unidade: data.valor_unidade,
          estoque: data.estoque,
          categoria: data.categoria,
          descricao: data.descricao,
        });
      });

      setPescadosCatalogo(listaPescados);
    } catch (e) {
      console.error("PescadoProvider, getPescadosPeixaria: " + e);
    }
  }

  async function registerPescado(
    pescado: Pescado,
    urlDevice: string,
  ): Promise<string> {
    try {
      if (!peixariaUser?.uid) {
        return "Nenhuma peixaria ativa encontrada para este gerente.";
      }

      const peixariaId = peixariaUser.uid;
      const novoPescadoRef = doc(collection(firestore, "pescados"));
      const pescadoId = novoPescadoRef.id;

      let urlStorage = "";

      if (urlDevice !== "") {
        const urlColetada = await sendPescadoImageToStorage(
          urlDevice,
          peixariaId,
          pescadoId,
        );
        if (!urlColetada) {
          return "Erro ao fazer upload da imagem do pescado. Tente novamente.";
        }
        urlStorage = urlColetada;
      }

      const pescadoFirestore = {
        nome: pescado.nome,
        peso_unidade: pescado.peso_unidade,
        valor_unidade: pescado.valor_unidade,
        estoque: pescado.estoque,
        categoria: pescado.categoria,
        descricao: pescado.descricao || "",
        urlFoto: urlStorage,
        peixariaId: peixariaId,
      };

      await setDoc(novoPescadoRef, pescadoFirestore);
      await getPescadosPeixaria();

      return "OK";
    } catch (error: any) {
      console.error("PescadoProvider, registerPescado: ", error);
      return "Erro ao cadastrar o pescado. Contate o suporte.";
    }
  }

  async function updatePescado(
    pescado: Pescado,
    urlDevice: string,
  ): Promise<string> {
    try {
      if (!peixariaUser?.uid) {
        return "Peixaria inválida.";
      }

      let urlStorage = pescado.urlFoto;

      if (urlDevice !== "") {
        const urlColetada = await sendPescadoImageToStorage(
          urlDevice,
          peixariaUser.uid,
          pescado.uid,
        );
        if (!urlColetada) {
          return "Erro ao atualizar a imagem do pescado. Tente novamente.";
        }
        urlStorage = urlColetada;
      }

      const pescadoFirestore = {
        nome: pescado.nome,
        peso_unidade: pescado.peso_unidade,
        valor_unidade: pescado.valor_unidade,
        estoque: pescado.estoque,
        categoria: pescado.categoria,
        descricao: pescado.descricao || "",
        urlFoto: urlStorage,
        peixariaId: peixariaUser.uid,
      };

      await setDoc(doc(firestore, "pescados", pescado.uid), pescadoFirestore, {
        merge: true,
      });

      await getPescadosPeixaria();

      return "OK";
    } catch (e) {
      console.error("PescadoProvider, updatePescado: " + e);
      return "Erro ao atualizar o pescado. Contate o suporte.";
    }
  }

  async function delPescado(pescadoId: string): Promise<string> {
    try {
      await deleteDoc(doc(firestore, "pescados", pescadoId));
      await getPescadosPeixaria();

      return "OK";
    } catch (e) {
      console.error("PescadoProvider, delPescado: " + e);
      return "Erro ao excluir o pescado. Contate o suporte.";
    }
  }

  async function sendPescadoImageToStorage(
    urlDevice: string,
    peixariaId: string,
    pescadoId: string,
  ): Promise<string | null> {
    try {
      const imageRedimencionada = await ImageManipulator.manipulateAsync(
        urlDevice,
        [{ resize: { width: 150, height: 150 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.PNG },
      );

      const data = await fetch(imageRedimencionada?.uri);
      const blob = await data.blob();

      const storageRef = ref(
        storage,
        `imagens/peixarias/${peixariaId}/pescados/${pescadoId}/foto.png`,
      );

      await uploadBytes(storageRef, blob);

      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Erro ao enviar imagem do pescado para o storage: ", error);
      return null;
    }
  }

  return (
    <PescadoContext.Provider
      value={{
        pescadosCatalogo,
        getPescadosPeixaria,
        registerPescado,
        updatePescado,
        delPescado,
      }}
    >
      {children}
    </PescadoContext.Provider>
  );
};
