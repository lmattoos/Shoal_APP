import { AuthContext } from "@/context/AuthProvider";
import { router } from "expo-router";
import { useContext, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Divider, List, useTheme } from "react-native-paper";


export default function Menu() {
	const theme = useTheme();
	const {sair} = useContext(AuthContext);
	const [dialogVisivel, setDialogVisivel] = useState(false);

	async function handleSair(){
		if(await sair()){
			router.replace("/entrar");
		} else {
			setDialogVisivel(true);
		}
	}
	return (
		<View style={{ ...styles.container, backgroundColor: theme.colors.background }}>
			<List.Item
				title="Perfil"
				description="Visualize e edite suas informações"
				left={()=> (
					<List.Icon color={theme.colors.primary} icon="smart-card-outline"/>
				)}
				onPress={() => router.push('/Perfil')}
			/>
			<Divider/>
			<List.Item
				title="Alterar senha"
				description="Altere sua senha de acesso"
				left={()=> (
					<List.Icon color={theme.colors.primary} icon="eye-arrow-right-outline"/>
				)}
				onPress={()=> alert("Em desenvolvimento")}
			/>
			<Divider/>
			<List.Item
				title="Sair"
				description="Encerre sua sessão atual"
				left={()=> (
					<List.Icon color={theme.colors.primary} icon="exit-run"/>
				)}
				onPress={handleSair}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingLeft: 20,
		paddingTop: 20,
		alignItems: "center",
	},
	textDialog: {
		textAlign: "center",
	},
});

