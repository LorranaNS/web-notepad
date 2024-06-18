const express = require("express");
const app = express();
const path = require("path");
const bcrypt = require('bcrypt');
const { Pool } = require("pg");
const url_bancoDados = "postgresql://Cljjg-2003@localhost:5432/activities"

const conexao = new Pool({
    connectionString: url_bancoDados,
})

app.set('views', (path.join(__dirname, 'frontend/templates')));
app.use(express.static(path.join(__dirname, "frontend/templates")));

// middlweware para lidaar com mensagens flash, que são armazenadas na sessão e limpas após serem exibidas ao usuário
const session = require('express-session');
const flash = require('connect-flash');

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

app.use(flash());
// Fim do flash

var bodyParser = require("body-parser"); // permite receber coisas do body
app.use(bodyParser.urlencoded({ extended: false}));
app.engine("html", require("ejs").renderFile);

app.get('/', async (req, res) => {
    res.render('cadastro.html');
});

// Rota GET para exibir o formulário de cadastro
app.get('/cadastrar', async (req, res) => {
    res.render('cadastro.html');
});

app.post("/cadastrar", async (req, res) => {
    const { nome, email, senha } = req.body;
    try{
        const {confirmar_senha} = req.body;

        if (senha != confirmar_senha) {
            req.flash('error_msg', 'As senhas não coincidem!');
                // return res.redirect('/cadastrar');
        }

        // Hash da senha antes de salvar no banco de dados
        const saltRounds = 10;
        const hash = await bcrypt.hash(senha, saltRounds);

        const connection = await conexao.connect();
        const insert = "INSERT INTO users (nome, email, hash) VALUES ($1, $2, $3)";
        await connection.query(insert, [nome, email, senha])
        connection.release();

        req.flash('success_msg', 'Usuário cadastrado com sucesso!')
    }catch (e) {
        console.log(e);
        req.flash('error_msg', 'Erro ao cadastrar usuário!')
    }
    res.redirect('/');
})

app.listen(3000,function (){
    console.log("Rodando na porta 3000")
  })
  