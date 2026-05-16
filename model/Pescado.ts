export class Pescado {
  public uid: string;
  public nome: string;
  public urlFoto: string;
  public peso_unidade: string;
  public valor_unidade: string;
  public estoque: string;
  public categoria: string;
  public descricao: string;
  constructor(
    uid: string,
    nome: string,
    urlFoto: string,
    peso_unidade: string,
    valor_unidade: string,
    estoque: string,
    categoria: string,
    descricao: string,
  ) {
    this.uid = uid;
    this.nome = nome;
    this.peso_unidade = peso_unidade;
    this.urlFoto = urlFoto;
    this.valor_unidade = valor_unidade;
    this.estoque = estoque;
    this.categoria = categoria;
    this.descricao = descricao;
  }
}
