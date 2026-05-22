export class Peixaria {
  public uid?: string;
  public nome: string;
  public urlFoto: string;
  public cnpj: string;
  public cpf: string;
  public email: string;
  public telefone: string;
  public descricao: string;
  public ownerId: string;
  constructor(
    nome: string,
    urlFoto: string,
    cnpj: string,
    cpf: string,
    email: string,
    telefone: string,
    descricao: string,
    ownerId: string,
    uid?: string,
  ) {
    this.uid = uid;
    this.email = email;
    this.nome = nome;
    this.urlFoto = urlFoto;
    this.telefone = telefone;
    this.cpf = cpf;
    this.cnpj = cnpj;
    this.descricao = descricao;
    this.ownerId = ownerId;
  }
}
