const requiredMessage = "Campo obrigatório";

const schema = yup
  .object()
  .shape({
    email: yup.string.required(requiredMessage).matches(/\S+@\S+\.\S+/, "Email inválido"),
    senha: yup.string.required(requiredMessage).matches(
      /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{8,}$/,
			"A senha deve conter ao menos uma letra maiúscula, uma letra minúscula, um númeral, um caractere especial e um total de 8 caracteres",
    ),
  })
  .required();

export default function Entrar() {
  return (
    <>
      
    </>
  );
}
