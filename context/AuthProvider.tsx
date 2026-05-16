import { auth, firestore, storage } from "@/firebase/firebaseinit";
import { Credencial } from "@/model/types";
import { Usuario } from "@/model/Usuario";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from "@firebase/auth";
import * as ImageManipulator from "expo-image-manipulator";
import * as SecureStore from "expo-secure-store";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { createContext, useState } from "react";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }: any) => {
  const [userAuth, setUserAuth] = useState<UserCredential | null>(null);

  async function armazenaCredencialnaCache(
    credencial: Credencial,
  ): Promise<void> {
    try {
      await SecureStore.setItemAsync("credencial", JSON.stringify(credencial));
    } catch (e) {
      console.error("Erro ao armazenar credencial na cache: ", e);
    }
  }

  async function recuperaCredencialdaCache(): Promise<Credencial | null> {
    try {
      const credencial = await SecureStore.getItemAsync("credencial");
      if (credencial) {
        return JSON.parse(credencial);
      }
      return null;
    } catch (e) {
      console.error("Erro ao recuperar credencial da cache: ", e);
      return null;
    }
  }

  async function signUp(usuario: Usuario, urlDevice: string): Promise<string> {
    try {
      if (usuario.email && usuario.senha) {
        const userCredencial = await createUserWithEmailAndPassword(
          auth,
          usuario.email,
          usuario.senha,
        );

        if (userCredencial) {
          if (urlDevice !== "") {
            const urlStorage = await sendImageToStorage(
              urlDevice,
              userCredencial.user.uid,
            );
            if (!urlStorage) {
              return "Erro ao cadastrar o usuário. Contate o suporte.";
            }
            usuario.urlFoto = urlStorage;
          }
          await sendEmailVerification(userCredencial.user);

          const usuarioFirestore = {
            email: usuario.email,
            nome: usuario.nome,
            urlFoto: usuario.urlFoto || "",
            telefone: usuario.telefone,
            cpf: usuario.cpf,
            cnpj: usuario.cnpj,
          };

          await setDoc(
            doc(firestore, "usuarios", userCredencial.user.uid),
            usuarioFirestore,
            { merge: true },
          );
        } else {
          return "Erro ao criar credenciais do usuário.";
        }
      } else {
        return "Email e senha são obrigatórios para cadastro.";
      }
      return "OK";
    } catch (error: any) {
      console.error(error.code, error.message);
      return launchServerMessageErro(error);
    }
  }

  async function signIn(credencial: Credencial): Promise<string> {
    try {
      const userCredencial = await signInWithEmailAndPassword(
        auth,
        credencial.email,
        credencial.senha,
      );
      if (!userCredencial.user.emailVerified) {
        return "Você precisa verificar seu email para continuar.";
      }
      setUserAuth(userCredencial);
      armazenaCredencialnaCache(credencial);
      return "OK";
    } catch (error: any) {
      console.error(error.code, error.message);
      return launchServerMessageErro(error);
    }
  }

  async function sair(): Promise<string> {
    try {
      await SecureStore.deleteItemAsync("credencial");
      await signOut(auth);
      return "OK";
    } catch (error: any) {
      console.error(error.code, error.message);
      return launchServerMessageErro(error);
    }
  }

  async function delAccount(): Promise<void> {
    if (userAuth?.user) {
      await deleteUser(userAuth.user);
    }
  }

  function launchServerMessageErro(e: any): string {
    switch (e.code) {
      case "auth/invalid-credential":
        return "Email inexistente ou senha errada.";
      case "auth/user-not-found":
        return "Usuário não cadastrado.";
      case "auth/wrong-password":
        return "Erro na senha.";
      case "auth/invalid-email":
        return "Email inexistente.";
      case "auth/user-disabled":
        return "Usuário desabilitado.";
      case "auth/email-already-in-use":
        return "Email em uso. Tente outro email.";
      default:
        return "Erro desconhecido. Contate o administrador";
    }
  }

  async function sendImageToStorage(
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

      const storageRef = ref(storage, `imagens/usuarios/${uid}/foto.png`);

      await uploadBytes(storageRef, blob);

      const url = await getDownloadURL(
        ref(storage, `imagens/usuarios/${uid}/foto.png`),
      );
      return url;
    } catch (error) {
      console.error("Erro ao enviar imagem para o storage: ", error);
      return null;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        signIn,
        sair,
        signUp,
        recuperaCredencialdaCache,
        delAccount,
        userAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
