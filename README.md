# SIGAAPI 🎓

**Nota**: Esse é um arquivo público de um projeto que não é mais mantido. Portanto, uma API de livre acesso não será disponibilizada.

[![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com) \
API para leitura remota de dados da Universidade Federal do Ceará. \
No presente momento, esta aplicação permite acessar:
* Dados de seu usuário do SIGAA, incluindo as cadeiras do semestre
* Créditos disponíveis no RU e histórico de uso do cartão
* Cardápio do RU, sendo possível especificar a data

**Link público para a API [http://localhost:3000](http://localhost:3000)**
## Rotas
### /sigaa
**Request**
```
POST http://localhost:3000/sigaa
```
Parâmetros | Descrição
------------ | -------------
login | login cadastrado no SIGAA
senha | senha cadastrada no SIGAA

**Response**
```javascript
{
  "error": false,
  "login": "login",
  "nome": "Lorem Ipsum",
  "foto": "https://si3.ufc.br/sigaa/img/no_picture.png",
  "matricula": "000000",
  "curso": "CIÊNCIA DA COMPUTAÇÃO",
  "nivel": "GRADUAÇÃO",
  "status": "ATIVO",
  "entrada": "2018.1",
  "semestre": "2019.2",
  "cadeiras": [
    {
      "codigo": "CK0000",
      "componente": "NOME DA CADEIRA",
      "carga_horaria": 96,
      "local": "915",
      "dias": "TER/QUI",
      "horario": "10:00-12:00"
    },
    /* ... */
  ]
}
```
### /creditos
**Request**
```
POST http://localhost:3000/creditos
```
Parâmetros | Descrição
------------ | -------------
matricula | matricula atrelada ao cartão
cartao | número do cartão

**Response**
```javascript
{
  "error": false,
  "creditos": 2,
  "historico": [
    {
      "data": "dd-mm-yyyy hh:mm:ss",
      "operacao": "Utilização do Cartão",
      "detalhes": "Refeição: Almoço"
    },
    /* ... */
  ]
}
```
### /cardapio
**Request**
```
GET http://localhost:3000/cardapio
```
```
GET http://localhost:3000/cardapio/yyyy-mm-dd
```
**Response**
```json
{
  "empty": false,
  "cafe": {
    "bebidas": [
      "Café",
      "Leite Quente/Frio",
      "Leite de Soja",
      "Suco de Caju"
    ],
    "paes": [
      "Pão Carioca",
      "Pão de Forma"
    ],
    "frutas": [
      "Goiaba",
      "Mamão"
    ],
    "especial": [
      "Presunto",
      "Queijo"
    ]
  },
  "almoco": {
    "principal": [
      "Carne Trinchada na Manteiga",
      "Frango a Carioca"
    ],
    "vegetariano": "Maria Isabel Vegana",
    "salada": "Vinagrete",
    "guarnicao": "Purê",
    "acompanhamento": [
      "Baião c/ Feijão Branco",
      "Arroz Integral",
      "Feijão de Corda"
    ],
    "suco": "Manga",
    "sobremesa": [
      "Banana",
      "Doce"
    ]
  },
  "jantar": {
    "principal": [
      "Isca de Carne M. Madeira",
      "Creme de Frango"
    ],
    "vegetariano": "Escondidinho de Soja",
    "salada": "Alface, Beterraba, Pepino e Manga",
    "guarnicao": "Farofa",
    "acompanhamento": [
      "Arroz Branco",
      "Arroz Integral",
      "Feijão Carioca"
    ],
    "suco": "Acerola",
    "sobremesa": [
      "Abacaxi",
      "Doce"
    ]
  }
}
```
## Desenvolvimento
SIGAAPI requer [Node.js](https://nodejs.org/) para funcionar.

Instale as dependências e inicie o servidor.

```sh
$ yarn
$ yarn start
```
Para testes (com nodemon)
```sh
$ yarn test
```
Licença
----
MIT
