export class Usuario {
  public uid: string;
  public email: string;
  public nome: string;
  public urlFoto: string;
  public telefone: string;
  public cpf: string;
  public cnpj: string;
  public senha?: string;
  constructor(
    uid: string,
    email: string,
    nome: string,
    urlFoto: string,
    telefone: string,
    cpf: string,
    cnpj: string,
    senha?: string,
  ) {
    this.uid = uid;
    this.email = email;
    this.nome = nome;
    this.urlFoto = urlFoto;
    this.telefone = telefone;
    this.cpf = cpf;
    this.cnpj = cnpj;
    this.senha = senha;
  }
}