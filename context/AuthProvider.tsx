import { auth } from "@/firebase/firebaseinit";
import { Credencial } from "@/model/types";
import { signInWithEmailAndPassword } from "@firebase/auth";
import * as SecureStore from "expo-secure-store";
import { createContext, useState } from "react";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }: any) => {
  const [userFirebase, setUserFirebase] = useState<any>(null);

  async function armazenaCredencialnaCache(credencial: Credencial): Promise<void> {
    try {
      await SecureStore.setItem("credencial", JSON.stringify(credencial));
    } catch (e){
      console.error("Erro ao armazenar credencial na cache: ", e);
    }
  }

  async function recuperaCredencialdaCache(): Promise<Credencial | null> {
    try {
      const credencial = await SecureStore.getItem("credencial");
      if (credencial) {
        return JSON.parse(credencial);
      }
      return null;
    } catch (e) {
      console.error("Erro ao recuperar credencial da cache: ", e);
      return null;
    }
  }

  async function signIn(credencial: Credencial): Promise<string> {
    try {
      const userCredencial = await signInWithEmailAndPassword(
        auth,
        credencial.email,
        credencial.senha,
      );
      setUserFirebase(userCredencial.user);
      armazenaCredencialnaCache(credencial);
      return "OK";
    } catch (error) {
      return launchServerMessageErro(error);
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

  return (
    <AuthContext.Provider value={{ signIn, recuperaCredencialdaCache }}>{children}</AuthContext.Provider>
  );
};
