import { AuthContext } from "@/context/AuthProvider";
import { Usuario } from "@/model/Usuario";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import { Image, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";
import { masks } from "@/utils/masks";

const requiredMessage = "Campo obrigatório";

const schema = yup
    .object()
    .shape({
        nome: yup.string().required(requiredMessage),
        email: yup.string().required(requiredMessage).matches(/\S+@\S+\.\S+/, "Email inválido"),
        senha: yup.string().required(requiredMessage).matches(
				/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{8,}$/,
				"A senha deve conter ao menos uma letra maiúscula, uma letra minúscula, um númeral, um caractere especial e um total de 8 caracteres"
		),
        confirmar_senha: yup.string().required(requiredMessage).equals([yup.ref("senha")], "As senhas devem ser iguais"),
        telefone: yup.string().required(requiredMessage).matches(/^\(\d{2}\) \d{5}\-\d{4}$/, "Telefone inválido"),
        cpf: yup.string().required(requiredMessage).matches(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/, "CPF inválido"),
        cnpj: yup.string().required(requiredMessage).matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/, "CNPJ inválido"),
    })
    .required();

export default function SignUp() {
    const theme = useTheme();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<any>({
        defaultValues: {
            nome: "",
            email: "",
            senha: "",
            confirmar_senha: "",
            telefone: "",
            cpf: "",
            cnpj: "",
        },
        mode: "onSubmit",
        resolver: yupResolver(schema),
    });

    const { signUp } = useContext(AuthContext);
    const [exibirSenha, setExibirSenha] = useState(true);
	const [requisitando, setRequisitando] = useState(false);
	const [dialogVisivel, setDialogVisivel] = useState(false);
	const [mensagem, setMensagem] = useState({ tipo: "", mensagem: "" });

    async function cadastrar(data: Usuario){
        setRequisitando(true);
        data.urlFoto = 
            "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50";
        const msg = await signUp(data);
        if (msg === "OK") {
            setMensagem({
				tipo: "OK",
				mensagem: `Você foi cadastrado com sucesso. Verifique seu email para validar sua conta.\n${data.email}`,
			});
            setDialogVisivel(true);
            setRequisitando(false);
        }
    }

    return (
        <SafeAreaView style={{ ...styles.container, backgroundColor: theme.colors.background }}>
            <ScrollView showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
                <>
                    <Image
                        style={styles.image}
                        source={require("../assets/images/shoal/Shoal(Logo).png")}
                    />
                    <Controller
                        control={control}
                        name="nome"
                        render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={styles.textinput}
                                    label="Nome"
                                    placeholder="Digite seu nome"
                                    mode="outlined"
                                    autoCapitalize="words"
                                    returnKeyType="next"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    right={<TextInput.Icon icon="smart-card"/>}
                                />
                            )
                        }
                    />
                    {errors.nome && (
                        <Text style={{ ...styles.textError, color: theme.colors.error }}>
                            {errors.nome?.message?.toString()}
                        </Text>
                    )}
                    <Controller
                        control={control}
                        name="email"
                        render={({field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={styles.textinput}
                                    label="E-mail"
                                    placeholder="Digite seu e-mail"
                                    mode="outlined"
                                    autoCapitalize="none"
                                    returnKeyType="next"
                                    keyboardType="email-address"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    right={<TextInput.Icon icon="email"/>}
                                />
                            )
                        }
                    />
                    {errors.email && (
                        <Text style={{ ...styles.textError, color: theme.colors.error }}>
                            {errors.email?.message?.toString()}
                        </Text>
                    )}
                    <Controller
						control={control}
                        name="senha"
						render={({ field: { onChange, onBlur, value } }) => (
							<TextInput
								style={styles.textinput}
								label="Senha"
								placeholder="Digite sua senha"
								mode="outlined"
								autoCapitalize="none"
								returnKeyType="next"
								secureTextEntry={exibirSenha}
								onBlur={onBlur}
								onChangeText={onChange}
								value={value}
								right={
									<TextInput.Icon
										icon="eye"
										onPress={() => setExibirSenha((previus) => !previus)}
									/>
								}
							/>
						)}
					/>
					{errors.senha && (
						<Text style={{ ...styles.textError, color: theme.colors.error }}>
							{errors.senha?.message?.toString()}
						</Text>
					)}
					<Controller
						control={control}
                        name="confirmar_senha"
						render={({ field: { onChange, onBlur, value } }) => (
							<TextInput
								style={styles.textinput}
								label="Confirmar senha"
								placeholder="Confirme sua senha"
								mode="outlined"
								autoCapitalize="none"
								returnKeyType="go"
								secureTextEntry={exibirSenha}
								onBlur={onBlur}
								onChangeText={onChange}
								value={value}
								right={
									<TextInput.Icon
										icon="eye"
										onPress={() => setExibirSenha((previus) => !previus)}
									/>
								}
							/>
						)}	
					/>
					{errors.confirmar_senha && (
						<Text style={{ ...styles.textError, color: theme.colors.error }}>
							{errors.confirmar_senha?.message?.toString()}
						</Text>
					)}
                    <Controller
                        control={control}
                        name="telefone"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={styles.textinput}
                                label="Telefone"
                                placeholder="(00) 00000-0000"
                                mode="outlined"
                                keyboardType="phone-pad"
                                onBlur={onBlur}
                                onChangeText={(text) => onChange(masks.telefone(text))}
                                value={value}
                                right={<TextInput.Icon icon="phone"/>}
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
                        render={({field: {onChange, onBlur, value}}) => (
                            <TextInput
                                style={styles.textinput}
                                label="CPF"
                                placeholder="000.000.000-00"
                                mode="outlined"
                                keyboardType="numeric"
                                onBlur={onBlur}
                                onChangeText={(text) => onChange(masks.cpf(text))}
                                value={value}
                                right={<TextInput.Icon icon="account-details"/>}
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
                        render={({field: {onChange, onBlur, value}}) => (
                            <TextInput
                                style={styles.textinput}
                                label="CNPJ"
                                placeholder="00.000.000/0001-00"
                                mode="outlined"
                                keyboardType="numeric"
                                returnKeyType="next"
                                onBlur={onBlur}
                                onChangeText={(text) => onChange(masks.cnpj(text))}
                                value={value}
                                right={<TextInput.Icon icon="office-building"/>}
                            />
                        )}
                    />
                    {errors.cnpj && (
                        <Text style={{ ...styles.textError, color: theme.colors.error }}>
                            {errors.cnpj?.message?.toString()}
                        </Text>
                    )}
                    <Button
                        style={styles.button}
                        mode="outlined"
                        onPress={handleSubmit(cadastrar)}
                        loading={requisitando}
                        disabled={requisitando}
                    >
                        {!requisitando ? "Cadastrar" : "Cadastrando"}
                    </Button>
                </>
            </ScrollView>
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
	textEsqueceuSenha: {
		alignSelf: "flex-end",
		marginTop: 20,
	},
	textCadastro: {},
	textError: {
		width: 350,
	},
	button: {
		marginTop: 50,
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