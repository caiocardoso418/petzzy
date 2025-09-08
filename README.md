# 🐾 Petzzy

Petzzy é uma plataforma web completa, desenvolvida como um projeto acadêmico, com o objetivo de conectar tutores de pets a uma variedade de profissionais de cuidados animais. A plataforma permite a visualização de serviços e possui um painel de administração robusto para gerenciar todo o conteúdo do site.

---

## 🚀 Funcionalidades Implementadas

-   **Páginas Públicas Dinâmicas:** Conteúdo das páginas "Quem Somos" e "Serviços" é carregado dinamicamente a partir do banco de dados.
-   **Painel de Administração:** Uma interface administrativa (`/admin`) que permite gerenciar todo o conteúdo do site sem a necessidade de alterar o código ou o banco de dados diretamente.
-   **API RESTful Completa:** Um backend robusto que oferece endpoints CRUD (Create, Read, Update, Delete) para todas as entidades do sistema.
-   **Arquitetura Desacoplada:** O frontend (HTML, CSS, JS) é servido pelo backend (Python/Flask), mas se comunica através de uma API, permitindo futuras expansões para outras plataformas (como um app mobile).

---

## 🛠️ Tecnologias Utilizadas

-   **Frontend**: HTML5, CSS3, JavaScript (Vanilla JS)
-   **Backend**: Python 3 com o framework Flask
-   **Banco de Dados**: PostgreSQL
-   **Comunicação com o Banco**: Biblioteca `psycopg2`
-   **Ambiente**: Gerenciamento com Ambientes Virtuais (`venv`)

---

## ⚙️ Como Executar o Projeto Localmente

Siga os passos abaixo para configurar e rodar a aplicação na sua máquina.

### Pré-requisitos

-   **Python 3.x** instalado.
-   **PostgreSQL** instalado e rodando.
-   Uma ferramenta de gerenciamento de banco de dados, como o **DBeaver**.

### 1. Configuração do Banco de Dados

1.  Abra o DBeaver (ou outra ferramenta) e crie um novo banco de dados chamado `petzzy_db`.
2.  Execute os scripts SQL abaixo para criar todas as tabelas necessárias:

    ```sql
    -- Tabela para o conteúdo da página "Quem Somos"
    CREATE TABLE conteudo_institucional (
        id SERIAL PRIMARY KEY,
        secao VARCHAR(50) NOT NULL UNIQUE,
        titulo VARCHAR(255) NOT NULL,
        texto TEXT,
        data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela para as categorias de serviço
    CREATE TABLE servicos (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(50) NOT NULL UNIQUE,
        nome VARCHAR(100) NOT NULL,
        descricao_curta VARCHAR(255),
        descricao_longa TEXT,
        deleted_at TIMESTAMP WITH TIME ZONE
    );

    -- Tabela para as características de cada serviço
    CREATE TABLE caracteristicas_servico (
        id SERIAL PRIMARY KEY,
        servico_id INT NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
        descricao VARCHAR(255) NOT NULL,
        ordem INT DEFAULT 0
    );
    ```

### 2. Configuração do Backend

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/petzzy.git](https://github.com/seu-usuario/petzzy.git)
    cd petzzy/backend
    ```

2.  **Crie e configure o arquivo de ambiente:**
    -   Crie um arquivo chamado `.env` dentro da pasta `backend`.
    -   Copie e cole o conteúdo abaixo, substituindo com suas credenciais do PostgreSQL.
    ```env
    # .env
    DB_HOST=localhost
    DB_NAME=petzzy_db
    DB_USER=postgres
    DB_PASSWORD=SUA_SENHA_SECRETA_DO_POSTGRES
    DB_PORT=5432
    ```

3.  **Crie e ative o ambiente virtual:**
    ```bash
    # Crie a pasta venv
    python -m venv venv

    # Ative o ambiente (Windows)
    venv\Scripts\activate

    # Ative o ambiente (Mac/Linux)
    # source venv/bin/activate
    ```

4.  **Instale as dependências:**
    ```bash
    pip install Flask Flask-Cors psycopg2-binary python-dotenv
    ```

5.  **Execute o servidor:**
    ```bash
    python app.py
    ```

### 3. Acessando a Aplicação

-   Com o servidor rodando, abra seu navegador.
-   **Site Público:** Acesse `http://127.0.0.1:5000/`
-   **Painel de Administração:** Acesse `http://127.0.0.1:5000/admin`

---

## 👥 Equipe

-   **Caio Peliz** - Backend
-   **João Pedro** - Frontend
-   **Juan** - Backend
-   **Maria Elis** - UI/UX Designer

