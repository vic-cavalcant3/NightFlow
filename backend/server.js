const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 4000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Conexão com o banco MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',          // ou a senha que você configurou no MySQL
  database: 'nightflow'   // nome do seu banco no phpMyAdmin
});

db.connect((err) => {
  if (err) {
    console.error('Erro na conexão com o MySQL:', err);
  } else {
    console.log('Conectado ao MySQL!');
  }
});



// Rota de cadastro
app.post('/cadastrar', (req, res) => {
  const { nome, email, telefone, senha } = req.body;

  const sql = 'INSERT INTO cadastro (nome, email, telefone, senha) VALUES (?, ?, ?, ?)';
  db.query(sql, [nome, email, telefone, senha], (err, result) => {
    if (err) {
      console.error('Erro ao inserir:', err);
      return res.status(500).send('Erro ao cadastrar');
    }
    res.send('Cadastro realizado com sucesso!');
  });
});


// Rota de login
app.post('/cadastro', (req, res) => {
  const { email, senha } = req.body;

  const sql = 'SELECT * FROM cadastro WHERE email = ? AND senha = ?';
  db.query(sql, [email, senha], (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json({ success: false, message: 'Erro interno' });
    }

    if (results.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Email ou senha incorretos' });
    }
  });
});


app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
