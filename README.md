# 📱 NightFlow – Aplicativo Mobile

NightFlow é um aplicativo mobile de organização pessoal, focado no gerenciamento de **metas** e **eventos**, desenvolvido com **React Native (Expo)** e **backend em Node.js**, utilizando **MySQL** como banco de dados.

O projeto tem como objetivo ajudar o usuário a organizar sua rotina, acompanhar metas pessoais e visualizar compromissos de forma simples e intuitiva.

---

## 🎯 Objetivo do Aplicativo

O NightFlow foi desenvolvido para:

- Criar e gerenciar metas pessoais  
- Acompanhar metas concluídas e pendentes  
- Organizar eventos com data e horário  
- Centralizar metas e compromissos em um único aplicativo  
- Praticar integração entre aplicativo mobile, backend e banco de dados  

---

## 📂 Estrutura do Projeto

```
NIGHTFLOW/
├── backend/                # Backend em Node.js (Express)
│   ├── server.js           # Servidor principal e rotas
│   ├── uploads/            # Upload de fotos de perfil
│   └── package.json
├── database/               # Arquivos SQL do banco de dados
│   └── nightflow.sql       # Estrutura do banco (tabelas)
├── mobile/                 # Aplicação Mobile (Expo / React Native)
│   ├── assets/             # Imagens e recursos
│   ├── src/                # Código-fonte do app
│   ├── App.js
│   ├── app.json
│   ├── package.json
│   └── package-lock.json
├── .gitignore
└── README.md

```
---

## ⚠️ Atenção – Configuração de IP (Muito Importante)
Para que o aplicativo funcione corretamente, é necessário ajustar o IP do backend.

É obrigatório atualizar o IP nos seguintes locais:

📄 backend/server.js
📄 Arquivos do app mobile que fazem requisições (fetch / axios)

❗ Não utilize "localhost" no React Native.

Utilize o IP local da máquina onde o backend está rodando, por exemplo:

[http://192.168.0.10:4000](http://192.168.0.10:4000)

Caso o IP esteja incorreto, o aplicativo não conseguirá se comunicar com o servidor.

## 🗄️ Banco de Dados
Os arquivos do banco de dados estão localizados na pasta:

/database

Para configurar o banco:

* Inicie o XAMPP (Apache e MySQL)
* Acesse o phpMyAdmin
* Crie o banco chamado: nightflow
* Importe o arquivo SQL da pasta /database

O backend utiliza MySQL para armazenar:

* Usuários
* Metas
* Eventos

▶️ Executando o Backend
Dentro da pasta backend:

npm install
node server.js

O servidor será iniciado na porta 4000.

📱 Executando o App Mobile
Dentro da pasta mobile:

npm install
npx expo start

Você pode:

* Abrir no navegador (tecla W)
* Abrir no celular usando o Expo Go

## 🎓 Contexto Acadêmico
Projeto desenvolvido com fins educacionais, focado no aprendizado prático de:

* React Native
* Expo
* Node.js
* MySQL
* Integração frontend e backend

🚀 Status do Projeto
🟡 Em desenvolvimento

📌 Observação
Este projeto ainda está em evolução e pode receber melhorias futuras, como autenticação mais segura, melhorias de UI/UX e deploy em produção.

Expo

Node.js

MySQL

Integração frontend e backend

🚀 Status do Projeto 🟡 Em desenvolvimento

📌 Observação Este projeto ainda está em evolução e pode receber melhorias futuras, como autenticação mais segura, melhorias de UI/UX e deploy em produção.
