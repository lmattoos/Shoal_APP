import { firestore } from "@/firebase/firebaseinit";
import { Usuario } from "@/model/Usuario";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthProvider";

export const UserContext = createContext({});

export const UserProvider = ({ children }: any) => {
	const { userAuth, delAccount } = useContext(AuthContext);
	const [userFirebase, setUserFirebase] = useState<Usuario | null>(null);

	useEffect(() => {
		if (userAuth) {
			getUser();
		}
	}, [userAuth]);

	async function getUser(): Promise<void> {
		try {
			if (!userAuth.user) {
				return;
			}
			const docSnap = await getDoc(
				doc(firestore, "usuarios", userAuth.user.uid)
			);
			if (docSnap.exists()) {
				let userData = docSnap.data();
				const usuario: Usuario = {
					uid: docSnap.id,
					email: userData.email,
					nome: userData.nome,
					urlFoto: userData.urlFoto,
					telefone: userData.telefone,
					cpf: userData.cpf,
                    cnpj: userData.cnpj
				};
				setUserFirebase(usuario);
			}
		} catch (e) {
			console.error("UserProvider, getUser: " + e);
		}
	}

	async function update(usuario: Usuario): Promise<string> {
		try {
			await setDoc(doc(firestore, "usuarios", usuario.uid), {
				email: usuario.email,
				nome: usuario.nome,
				urlFoto: usuario.urlFoto,
				telefone: usuario.telefone,
				cpf: usuario.cpf,
                cnpj: usuario.cnpj
			});
			setUserFirebase(usuario);
			return "OK";
		} catch (e) {
			console.error(e);
			return "Erro ao atualizar o usuário. Contate o suporte.";
		}
	}

	async function del(uid: string): Promise<string> {
		try {
			await deleteDoc(doc(firestore, "usuarios", uid));
			await delAccount(); 
			return "OK";
		} catch (e) {
			console.error(e);
			return "Erro ao excluir a conta. Contate o suporte.";
		}
	}

	return (
		<UserContext.Provider value={{ userFirebase, update, del }}>
			{children}
		</UserContext.Provider>
	);
};