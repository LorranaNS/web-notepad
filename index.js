const express = require("express");
const app = express();
const path = require("path");
const bcrypt = require('bcrypt');
const { Pool } = require("pg");
const env = require('dotenv').config();

// const url_bancoDados = "postgresql://Cljjg-2003@localhost:5432/activities";

if (env.error) {
    console.error("Error loading .env file");
}

const conexao = new Pool({
    // connectionString: url_bancoDados,
    host: 'localhost',
    port: 5432,
    database: 'projetos',
    user: process.env.USER_BD,
    password: process.env.PASSWORD_BD
})

app.set('views', (path.join(__dirname, 'frontend/templates')));
app.use(express.static(path.join(__dirname, "frontend/templates")));

// middlweware para lidar com mensagens flash, que são armazenadas na sessão e limpas após serem exibidas ao usuário
const session = require('express-session');
const flash = require('connect-flash');

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

app.use ((req, res, next) => { 
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});
// Fim do flash

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false}));
app.engine("html", require("ejs").renderFile);

app.get('/', async (req, res) => {
    res.render('cadastro.ejs');
});

// Rota GET para exibir o formulário de cadastro
app.get('/cadastrar', async (req, res) => {
    res.render('cadastro.ejs');
});

app.post("/cadastrar", async (req, res) => {
    const { nome, email, senha } = req.body;
    try{
        const {confirmar_senha} = req.body;

        if (senha != confirmar_senha) {
            req.flash('error_msg', 'As senhas não coincidem! Por favor, coloque senhas iguais nos campos.');
            return res.redirect('/cadastrar');
        }

        // Verificar se o e-mail já existe
        const connection = await conexao.connect();
        const checkEmail = "SELECT * FROM notepad.users WHERE email = $1";
        const user = await connection.query(checkEmail, [email]);

        if (user.rows.length > 0) {
            req.flash('error_msg', 'Este e-mail já está em uso.');
            return res.redirect('/cadastrar');
        }

        // Hash da senha antes de salvar no banco de dados
        const saltRounds = 10;
        const hash = await bcrypt.hash(senha, saltRounds);

        const insert = "INSERT INTO notepad.users (nome, email, hash) VALUES ($1, $2, $3)";
        await connection.query(insert, [nome, email, hash])
        connection.release();

        req.flash('success_msg', 'Usuário cadastrado com sucesso!')
        return res.redirect('/login');
    }catch (e) {
        console.log(e);
        req.flash('error_msg', 'Erro ao cadastrar usuário. Por favor, tente novamente.');
        res.redirect('/cadastrar');
    }
})

app.get('/login', async (req, res) => {
    res.render('login.ejs');
});

app.post ('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const connection = await conexao.connect();
        const checkEmail = "SELECT * FROM notepad.users WHERE email = $1";
        const user = await connection.query(checkEmail, [email]);

        if (user.rows.length == 0) {
            req.flash('error_msg', 'E-mail não cadastrado.');
            return res.redirect('/login');
        }

        const checkPassword = await bcrypt.compare(senha, user.rows[0].hash);

        if (!checkPassword) {
            req.flash('error_msg', 'Senha incorreta.');
            return res.redirect('/login');
        }

        // Armazenar o nome do usuário na sessão
        req.session.nome = user.rows[0].nome;

        req.flash('success_msg', 'Login efetuado com sucesso!');
        return res.redirect('/home');
    } catch (e) {
        console.log(e);
        req.flash('error_msg', 'Erro ao fazer login. Por favor, tente novamente.');
        res.redirect('/login');
    }
});

app.get('/home', async (req, res) => {
    res.render('home.html', { nome: req.session.nome});
});

app.post('/deslogar', (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/login');
    });
});

app.listen(3000,function (){
    console.log("Rodando na porta 3000")
})
  