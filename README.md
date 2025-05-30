# Sistema de Recomendação Inteligente de Livros

## Descrição

Este projeto é um sistema completo de recomendação de livros que permite aos usuários se cadastrarem, fazerem login, pesquisar e receber recomendações personalizadas com base em seus gostos. A aplicação consome a API do Google Books para ampliar o catálogo disponível e oferece uma interface web simples e interativa.

---

## Funcionalidades Principais

- **Cadastro e Login de Usuários:** Autenticação segura com JWT para acesso personalizado.
- **Sistema de Recomendação:** Recomenda livros baseados em preferências dos usuários e dados coletivos.
- **Avaliação de Livros:** Usuários podem avaliar livros para melhorar recomendações futuras.
- **Pesquisa de Livros:** Busca avançada utilizando a API do Google Books.
- **Interface Interativa:** Exibição visual dos livros com capa, título, autores e descrição.
- **Dockerização:** Backend, frontend e banco de dados orquestrados via Docker Compose para fácil deploy.

---

## Tecnologias Utilizadas

- Backend: FastAPI, SQLAlchemy, PostgreSQL, Python
- Frontend: HTML, CSS, JavaScript puro
- Autenticação: JWT (JSON Web Token)
- Contêineres: Docker e Docker Compose
- API Externa: Google Books API

---

## Como Executar o Projeto Localmente

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado

### Passos

1. Clone este repositório:

   ```bash
   git clone https://github.com/seu_usuario/seu_repositorio.git
   cd seu_repositorio

Suba os contêineres com Docker Compose:
docker-compose up --build


Acesse o frontend no navegador:
http://localhost:3000

http://localhost:8000/api

Sistema de Recomendação Inteligente de Livros/
├── backend/
│   ├── main.py               # API FastAPI
│   ├── models.py             # Modelos de dados SQLAlchemy
│   ├── auth.py               # Autenticação JWT e segurança
│   ├── Dockerfile            # Dockerfile backend
│   ├── requirements.txt      # Dependências Python
│   └── nginx.conf            # Configuração Nginx (se usada)
├── frontend/
│   ├── index.html            # Página principal
│   ├── style.css             # Estilos CSS
│   ├── script.js             # Código JS
│   ├── Dockerfile            # Dockerfile frontend
│   └── package-lock.json     # Dependências frontend (se aplicável)
├── docker-compose.yml        # Orquestração Docker
└── README.md                 # Documentação

Contato
vinicius marques — vinyvirtus18@gmail.com
LinkedIn | GitHub

