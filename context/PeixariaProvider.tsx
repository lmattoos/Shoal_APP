import { firestore, storage } from "@/firebase/firebaseinit";
import { Peixaria } from "@/model/Peixaria";
import * as ImageManipulator from "expo-image-manipulator";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthProvider";

export const PeixariaContext = createContext({});

export const PeixariaProvider = ({ children }: any) => {
  const { userAuth } = useContext<any>(AuthContext);
  const [peixariaUser, setPeixariaUser] = useState<Peixaria | null>(null);

  useEffect(() => {
    if (userAuth) {
      getPeixariaUser();
    } else {
      setPeixariaUser(null);
    }
  }, [userAuth]);

  async function getPeixariaUser(): Promise<void> {
    try {
      if (!userAuth?.user) {
        return;
      }

      const q = query(
        collection(firestore, "peixarias"),
        where("ownerId", "==", userAuth.user.uid),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        let peixariaData = docSnap.data();

        const peixaria: Peixaria = {
          uid: docSnap.id,
          nome: peixariaData.nome,
          email: peixariaData.email,
          telefone: peixariaData.telefone,
          cpf: peixariaData.cpf,
          cnpj: peixariaData.cnpj,
          descricao: peixariaData.descricao,
          urlFoto: peixariaData.urlFoto,
          ownerId: peixariaData.ownerId,
        };
        setPeixariaUser(peixaria);
      } else {
        setPeixariaUser(null);
      }
    } catch (e) {
      console.error("PeixariaProvider, getPeixariaUser: " + e);
    }
  }

  async function registerPeixaria(
    peixaria: Peixaria,
    urlDevice: string,
  ): Promise<string> {
    try {
      if (!userAuth?.user) {
        return "Usuário não autenticado.";
      }

      const ownerId = userAuth.user.uid;
      const novaPeixariaRef = doc(collection(firestore, "peixarias"));
      const peixariaId = novaPeixariaRef.id;

      let urlStorage = "";

      if (urlDevice !== "") {
        const urlColetada = await sendPeixariaImageToStorage(
          urlDevice,
          peixariaId,
        );
        if (!urlColetada) {
          return "Erro ao fazer upload da imagem da peixaria. Tente novamente.";
        }
        urlStorage = urlColetada;
      }

      const peixariaFirestore = {
        nome: peixaria.nome,
        email: peixaria.email,
        telefone: peixaria.telefone,
        cpf: peixaria.cpf,
        cnpj: peixaria.cnpj,
        descricao: peixaria.descricao || "",
        urlFoto: urlStorage,
        ownerId: ownerId,
      };

      await setDoc(novaPeixariaRef, peixariaFirestore);

      await setDoc(
        doc(firestore, "usuarios", ownerId),
        { temPeixaria: true },
        { merge: true },
      );

      setPeixariaUser({
        uid: peixariaId,
        ...peixariaFirestore,
      });

      return "OK";
    } catch (error: any) {
      console.error("PeixariaProvider, registerPeixaria: ", error);
      return "Erro ao cadastrar a peixaria. Contate o suporte.";
    }
  }

  async function updatePeixaria(
    peixaria: Peixaria,
    urlDevice: string,
  ): Promise<string> {
    try {
      let urlStorage = peixaria.urlFoto;

      if (urlDevice !== "") {
        const urlColetada = await sendPeixariaImageToStorage(
          urlDevice,
          peixaria.uid,
        );
        if (!urlColetada) {
          return "Erro ao atualizar a imagem da peixaria. Tente novamente.";
        }
        urlStorage = urlColetada;
      }

      const peixariaFirestore = {
        nome: peixaria.nome,
        email: peixaria.email,
        telefone: peixaria.telefone,
        cpf: peixaria.cpf,
        cnpj: peixaria.cnpj,
        descricao: peixaria.descricao || "",
        urlFoto: urlStorage,
        ownerId: peixaria.ownerId,
      };

      await setDoc(
        doc(firestore, "peixarias", peixaria.uid),
        peixariaFirestore,
        {
          merge: true,
        },
      );

      setPeixariaUser({
        uid: peixaria.uid,
        ...peixariaFirestore,
      });

      return "OK";
    } catch (e) {
      console.error("PeixariaProvider, updatePeixaria: " + e);
      return "Erro ao atualizar a peixaria. Contate o suporte.";
    }
  }

  async function delPeixaria(
    peixariaId: string,
    ownerId: string,
  ): Promise<string> {
    try {
      await deleteDoc(doc(firestore, "peixarias", peixariaId));

      await setDoc(
        doc(firestore, "usuarios", ownerId),
        { temPeixaria: false },
        { merge: true },
      );

      setPeixariaUser(null);
      return "OK";
    } catch (e) {
      console.error("PeixariaProvider, delPeixaria: " + e);
      return "Erro ao excluir a peixaria. Contate o suporte.";
    }
  }

  async function sendPeixariaImageToStorage(
    urlDevice: string,
    peixariaId: string,
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
        `imagens/peixarias/${peixariaId}/logo.png`,
      );

      await uploadBytes(storageRef, blob);

      const url = await getDownloadURL(
        ref(storage, `imagens/peixarias/${peixariaId}/logo.png`),
      );
      return url;
    } catch (error) {
      console.error(
        "Erro ao enviar imagem da peixaria para o storage: ",
        error,
      );
      return null;
    }
  }

  return (
    <PeixariaContext.Provider
      value={{
        peixariaUser,
        getPeixariaUser,
        registerPeixaria,
        updatePeixaria,
        delPeixaria,
      }}
    >
      {children}
    </PeixariaContext.Provider>
  );
};
