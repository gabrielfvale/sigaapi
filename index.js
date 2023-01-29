const express = require("express");
const bodyParser = require("body-parser");

const sigaa = require("./modules/sigaa");
const creditos = require("./modules/creditos");
const cardapio = require("./modules/cardapio");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const config = {
  port: process.env.PORT || 3000,
};

app.get("/", (_, res) => {
  res.send("API para leitura remota de dados da Universidade Federal do Ceará");
});

app.post("/sigaa", (req, res) => {
  const { login, senha } = req.body;
  sigaa.access(login, senha).then((response) => {
    res.send(sigaa.scrape(response, login));
  });
});

app.post("/creditos", (req, res) => {
  const { matricula, cartao } = req.body;
  creditos.access(cartao, matricula).then((result) => {
    res.send(creditos.scrape(result));
  });
});

app.get("/cardapio/:data?", (req, res) => {
  const data = req.params.data;
  cardapio.access(data).then((result) => {
    res.send(cardapio.scrape(result));
  });
});

module.exports = app;
