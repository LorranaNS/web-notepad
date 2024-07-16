Bem-vindo ao web-notepad! Utilizamos um servidor em node.js e banco de dados, com CRUD completo, para construção de um bloco de anotações web. 

## Índice 

- [Sobre o Projeto](#sobre-o-projeto)
- [Como Funciona](#como-funciona)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Uso](#uso)
- [Contribuindo](#contribuindo)
- [Problemas Comuns](#problemas-comuns)
- [Contato](#contato)


## Sobre o Projeto
Este projeto foi desenvolvido com o intuito de proporcionar ao usuário uma experiência fácil e rápida com um bloco de anotação web. A tela principal já traz todas as anotações do usuário, com ferramentas fáceis e intuitivas para ler, editar ou excluir a nota.

## Como Funciona

1. O usuário precisa fazer o cadastro e depois login para acessar as funcionalidades do bloco de anotações.
2. Após o login, o usuário pode criar, ler, atualizar e excluir as suas notas.

## Pré-requisitos

Certifique-se de ter os seguintes softwares instalados:

* Node.js v20.14.0
* PostgreSQL

Além disso, é necessário configurar o banco de dados PostgreSQL com as seguintes tabelas:

```
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    hash VARCHAR(255) NOT NULL
);

CREATE TABLE public.notes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES public.users(id),
    title VARCHAR(255),
    content TEXT
);
```

## Instalação

1. Clone o repositório:
```
git clone https://github.com/guiibrag4/web-notepad.git
```
2. Navegue até o diretório do projeto:
```
cd web-notepad
```
3.  Instale as dependências:
```
npm install
```
4.  Configure o arquivo .env com as informações do banco de dados:
```
USER_BD=seu-usuario
PASSWORD_BD=sua-senha
```

## Uso

1. Inicie o servidor no terminal:
```
node index.js
```

2. Acesse http://localhost:3000 no seu navegador.

## Contribuindo

Contribuições são bem-vindas! Por favor, siga os passos abaixo para contribuir:

1. Fork o repositório.
2. Crie uma nova branch:

```
git checkout -b feature/sua-feature
```

3. Faça suas modificações.
4. Faça o commit das suas alterações:

```
git commit -m 'Adiciona nova funcionalidade'
```


5. Envie para o branch:
```
git push origin feature/sua-feature
```

6. Abra um Pull Request.

## Problemas Comuns

* Erro ao carregar o arquivo .env: Certifique-se de que o arquivo .env está corretamente configurado e que as variáveis de ambiente estão corretas.
* Banco de dados não conectado: Verifique se o banco de dados PostgreSQL está rodando e se as credenciais estão corretas.

## Contato

Para perguntas ou sugestões, sinta-se à vontade para abrir uma issue ou entrar em contato:

- **Email**: prokelvin65@gmail.com
- **GitHub**: [kelvin-sous](https://github.com/kelvin-sous)
- 
- **Email**: guilhermebragariosdacosta@gmail.com
- **GitHub**: [guiibrag4](https://github.com/guiibrag4)

---
