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
  password: '',
  database: 'nightflow'
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
  console.log('📥 Cadastro recebido:', { nome, email, telefone, senha });
  
  const sql = 'INSERT INTO cadastro (nome, email, telefone, senha) VALUES (?, ?, ?, ?)';
  db.query(sql, [nome, email, telefone, senha], (err, result) => {
    if (err) {
      console.error('Erro ao inserir:', err);
      return res.status(500).send('Erro ao cadastrar');
    }
    res.status(201).json({ success: true, message: 'Cadastro realizado com sucesso!' });
  });
});

// Rota de login 
app.post('/login', (req, res) => { 
  const { email, senha } = req.body; 
  console.log('🔐 Tentativa de login:', { email, senha }); 
  
  const sql = 'SELECT * FROM cadastro WHERE email = ? AND senha = ?'; 
  db.query(sql, [email, senha], (err, results) => { 
    if (err) { 
      console.error('Erro ao buscar usuário:', err); 
      return res.status(500).json({ success: false, message: 'Erro interno' }); 
    } 
    
    if (results.length > 0) {
      const usuario = results[0];
      delete usuario.senha; // Remove a senha da resposta
      
      res.json({ 
        success: true, 
        usuario: usuario 
      }); 
    } else { 
      res.json({ success: false, message: 'Email ou senha incorretos' }); 
    } 
  }); 
});

// ==================== ROTAS PARA METAS ====================

// Buscar metas do usuário
app.get('/metas/:usuario_id', (req, res) => {
  const { usuario_id } = req.params;
  console.log('🎯 Buscando metas para usuário:', usuario_id);
  
  const sql = 'SELECT * FROM metas WHERE usuario_id = ? ORDER BY data_criacao DESC';
  db.query(sql, [usuario_id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar metas:', err);
      return res.status(500).json({ success: false, message: 'Erro ao buscar metas' });
    }
    
    res.json({ success: true, metas: results });
  });
});

// Criar nova meta
app.post('/metas', (req, res) => {
  const { usuario_id, titulo, descricao, prazo } = req.body;
  console.log('📝 Criando nova meta:', { usuario_id, titulo, descricao, prazo });
  
  const sql = 'INSERT INTO metas (usuario_id, titulo, descricao, prazo) VALUES (?, ?, ?, ?)';
  db.query(sql, [usuario_id, titulo, descricao, prazo], (err, result) => {
    if (err) {
      console.error('Erro ao criar meta:', err);
      return res.status(500).json({ success: false, message: 'Erro ao criar meta' });
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Meta criada com sucesso!',
      meta_id: result.insertId 
    });
  });
});

// Atualizar meta (marcar como concluída, editar, etc.)
app.put('/metas/:meta_id', (req, res) => {
  const { meta_id } = req.params;
  const { titulo, descricao, prazo, status } = req.body;
  console.log('✏️ Atualizando meta:', { meta_id, titulo, descricao, prazo, status });
  
  let sql = 'UPDATE metas SET titulo = ?, descricao = ?, prazo = ?, status = ?';
  let params = [titulo, descricao, prazo, status];
  
  // Se está marcando como concluída, adiciona a data de conclusão
  if (status === 'concluida') {
    sql += ', concluidoEm = CURDATE()';
  }
  
  sql += ' WHERE id = ?';
  params.push(meta_id);
  
  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Erro ao atualizar meta:', err);
      return res.status(500).json({ success: false, message: 'Erro ao atualizar meta' });
    }
    
    res.json({ success: true, message: 'Meta atualizada com sucesso!' });
  });
});

// Deletar meta
app.delete('/metas/:meta_id', (req, res) => {
  const { meta_id } = req.params;
  console.log('🗑️ Deletando meta:', meta_id);
  
  const sql = 'DELETE FROM metas WHERE id = ?';
  db.query(sql, [meta_id], (err, result) => {
    if (err) {
      console.error('Erro ao deletar meta:', err);
      return res.status(500).json({ success: false, message: 'Erro ao deletar meta' });
    }
    
    res.json({ success: true, message: 'Meta deletada com sucesso!' });
  });
});

// ==================== ROTAS PARA EVENTOS ====================

// Buscar eventos do usuário
app.get('/eventos/:usuario_id', (req, res) => {
  const { usuario_id } = req.params;
  console.log('📅 Buscando eventos para usuário:', usuario_id);
  
  const sql = 'SELECT * FROM eventos WHERE usuario_id = ? ORDER BY data ASC, horaInicio ASC';
  db.query(sql, [usuario_id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar eventos:', err);
      return res.status(500).json({ success: false, message: 'Erro ao buscar eventos' });
    }
    
    res.json({ success: true, eventos: results });
  });
});

// Criar novo evento
app.post('/eventos', (req, res) => {
  const { usuario_id, titulo, descricao, data, horaInicio, horaFim } = req.body;
  console.log('📝 Criando novo evento:', { usuario_id, titulo, descricao, data, horaInicio, horaFim });
  
  const sql = 'INSERT INTO eventos (usuario_id, titulo, descricao, data, horaInicio, horaFim) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [usuario_id, titulo, descricao, data, horaInicio, horaFim], (err, result) => {
    if (err) {
      console.error('Erro ao criar evento:', err);
      return res.status(500).json({ success: false, message: 'Erro ao criar evento' });
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Evento criado com sucesso!',
      evento_id: result.insertId 
    });
  });
});

// Atualizar evento
app.put('/eventos/:evento_id', (req, res) => {
  const { evento_id } = req.params;
  const { titulo, descricao, data, horaInicio, horaFim } = req.body;
  console.log('✏️ Atualizando evento:', { evento_id, titulo, descricao, data, horaInicio, horaFim });
  
  const sql = 'UPDATE eventos SET titulo = ?, descricao = ?, data = ?, horaInicio = ?, horaFim = ? WHERE id = ?';
  db.query(sql, [titulo, descricao, data, horaInicio, horaFim, evento_id], (err, result) => {
    if (err) {
      console.error('Erro ao atualizar evento:', err);
      return res.status(500).json({ success: false, message: 'Erro ao atualizar evento' });
    }
    
    res.json({ success: true, message: 'Evento atualizado com sucesso!' });
  });
});

// Deletar evento
app.delete('/eventos/:evento_id', (req, res) => {
  const { evento_id } = req.params;
  console.log('🗑️ Deletando evento:', evento_id);
  
  const sql = 'DELETE FROM eventos WHERE id = ?';
  db.query(sql, [evento_id], (err, result) => {
    if (err) {
      console.error('Erro ao deletar evento:', err);
      return res.status(500).json({ success: false, message: 'Erro ao deletar evento' });
    }
    
    res.json({ success: true, message: 'Evento deletado com sucesso!' });
  });
});

// ==================== ESTATÍSTICAS ====================

// Buscar estatísticas do usuário
app.get('/estatisticas/:usuario_id', (req, res) => {
  const { usuario_id } = req.params;
  console.log('📊 Buscando estatísticas para usuário:', usuario_id);
  
  const sql = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) as concluidas,
      SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pendentes
    FROM metas 
    WHERE usuario_id = ?
  `;
  
  db.query(sql, [usuario_id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar estatísticas:', err);
      return res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas' });
    }
    
    const estatisticas = results[0] || { total: 0, concluidas: 0, pendentes: 0 };
    res.json({ success: true, estatisticas });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});