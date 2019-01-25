const express = require('express');
const bodyParser = require('body-parser');

const MongoClient = require('mongodb').MongoClient;
const Browser = require('zombie');

const sigaa = require('./modules/sigaa');
const creditos = require('./modules/creditos');
const cardapio = require('./modules/cardapio');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const config = {
  port: 3000,
  mongoURI: 'mongodb://test:test123@ds163013.mlab.com:63013/sigaapi',
  mongoCollection: 'users'
}

app.get('/', (req, res) => {
  res.send('API para leitura remota de dados da Universidade Federal do Ceará');
})

app.post('/sigaa', async (req, res) => {
  const { login, senha } = req.body;
  const start = Math.round(new Date() / 1000);
  sigaa.access(login, senha)
  .then(result => {
    if (result) {
      db.collection(config.mongoCollection).findOne({ username: { $eq: login } }, (err, qres) => {
        if (!qres) {
          db.collection(config.mongoCollection).insertOne({ username: login, date: new Date().toUTCString() }, () => {
            console.log(`Novo login de usuário! ${new Date()}`)
          })
        };
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        sigaa.scrape(result).write().pipe(res);
        console.log("Done in " + (Math.round(new Date() / 1000) - start) + "s");
      })
    } else {
      res.send({ error: 'Nome de usuário ou senha inválidos' });
      console.log("Done in " + (Math.round(new Date() / 1000) - start) + "s");
    }
  });
});

app.post('/creditos', async (req, res) => {
  const { matricula, cartao } = req.body;
  creditos.access(cartao, matricula)
  .then(result => {
    if (result) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      creditos.scrape(result).write().pipe(res);
    } else {
      res.send({ error: 'Matrícula ou número do cartão inválidos' });
    }
  });
});

app.get('/cardapio/:data?', async (req, res) => {
  const data = req.params.data;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  cardapio.scrape(data).write().pipe(res);
})

MongoClient.connect(config.mongoURI, { useNewUrlParser: true }, (err, client) => {
  db = client.db('sigaapi');
  app.listen(config.port, () => {
    console.log(`API running on port ${config.port}`)
  });
});
