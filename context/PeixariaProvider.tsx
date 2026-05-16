import { firestore, storage } from "@/firebase/firebaseinit";
import { Peixaria } from "@/model/Peixaria";
import * as ImageManipulator from "expo-image-manipulator";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
      const docSnap = await getDoc(
        doc(firestore, "peixarias", userAuth.user.uid),
      );
      if (docSnap.exists()) {
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
    uid: string,
    peixaria: Peixaria,
    urlDevice: string,
  ): Promise<string> {
    try {
      let urlStorage = "";

      if (urlDevice !== "") {
        const urlColetada = await sendPeixariaImageToStorage(urlDevice, uid);
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
      };

      await setDoc(doc(firestore, "peixarias", uid), peixariaFirestore, {
        merge: true,
      });

      await setDoc(
        doc(firestore, "usuarios", uid),
        { temPeixaria: true },
        { merge: true },
      );

      return "OK";
    } catch (error: any) {
      console.error("PeixariaProvider, registerPeixaria: ", error);
      return "Erro ao cadastrar a peixaria. Contate o suporte.";
    }
  }

  async function updatePeixaria(
    uid: string,
    peixaria: Peixaria,
    urlDevice: string,
  ): Promise<string> {
    try {
      let urlStorage = peixaria.urlFoto;

      if (urlDevice !== "") {
        const urlColetada = await sendPeixariaImageToStorage(urlDevice, uid);
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
      };

      await setDoc(doc(firestore, "peixarias", uid), peixariaFirestore, {
        merge: true,
      });

      setPeixariaUser({
        uid: uid,
        ...peixariaFirestore,
      });

      return "OK";
    } catch (e) {
      console.error("PeixariaProvider, updatePeixaria: " + e);
      return "Erro ao atualizar a peixaria. Contate o suporte.";
    }
  }

  async function sendPeixariaImageToStorage(
    urlDevice: string,
    uid: string,
  ): Promise<string | null> {
    try {
      const imageRedimencionada = await ImageManipulator.manipulateAsync(
        urlDevice,
        [{ resize: { width: 150, height: 150 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.PNG },
      );

      const data = await fetch(imageRedimencionada?.uri);
      const blob = await data.blob();

      const storageRef = ref(storage, `imagens/peixarias/${uid}/logo.png`);

      await uploadBytes(storageRef, blob);

      const url = await getDownloadURL(
        ref(storage, `imagens/peixarias/${uid}/logo.png`),
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
      }}
    >
      {children}
    </PeixariaContext.Provider>
  );
};
