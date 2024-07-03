const express = require("express");
const app = express();
const path = require("path");
const bcrypt = require('bcrypt');
const { Pool } = require("pg");
const env = require('dotenv').config();

app.use (express.json());


const url_bancoDados = "postgresql://notepad_owner:msWqpU90OcLV@ep-wild-base-a53xmivn.us-east-2.aws.neon.tech/notepad?sslmode=require";

if (env.error) {
    console.error("Error loading .env file");
}

const conexao = new Pool({
    connectionString: url_bancoDados,
    // host: 'localhost',
    // port: 5432,
    // database: 'projetos',
    // user: process.env.USER_BD,
    // password: process.env.PASSWORD_BD
})

app.set('views', (path.join(__dirname, 'frontend/templates')));
app.use(express.static(path.join(__dirname, "frontend/templates")));

// Middlweware para lidar com mensagens flash, que são armazenadas na sessão e limpas após serem exibidas ao usuário.
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
// Fim do  Middleeware flash

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
        const checkEmail = "SELECT * FROM public.users WHERE email = $1";
        const user = await connection.query(checkEmail, [email]);

        if (user.rows.length > 0) {
            req.flash('error_msg', 'Este e-mail já está em uso.');
            return res.redirect('/cadastrar');
        }

        // Hash da senha antes de salvar no banco de dados
        const saltRounds = 10;
        const hash = await bcrypt.hash(senha, saltRounds);

        const insert = "INSERT INTO public.users (nome, email, hash) VALUES ($1, $2, $3)";
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

function ensureAuthenticated(req, res, next) {
    if (req.session.user_id) {
        return next();
    } else {
        req.flash('error_msg', 'Por favor, faça login para acessar essa página.');
        res.redirect('/login');
    }
}

app.get('/home',  ensureAuthenticated, async (req, res) => {
    res.render('home.ejs', { nome: req.session.nome});
});


app.get('/login', async (req, res) => {
    res.render('login.ejs');
});

app.post ('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const connection = await conexao.connect();
        const checkEmail = "SELECT * FROM public.users WHERE email = $1";
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
        req.session.user_id = user.rows[0].id;

        req.flash('success_msg', 'Login efetuado com sucesso!');
        return res.redirect('/home');
    } catch (e) {
        console.log(e);
        req.flash('error_msg', 'Erro ao fazer login. Por favor, tente novamente.');
        res.redirect('/login');
    }
});

app.post('/deslogar', (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/login');
    });
});

app.post('/criarNota', ensureAuthenticated, async (req, res) => {
    console.log(req.body);
    var { title, content } = req.body;
    var user_id = req.session.user_id;

    try {
        const connection = await conexao.connect();
        const insertNote = "INSERT INTO public.notes (user_id, title, content) VALUES ($1, $2, $3)";
        await connection.query(insertNote, [user_id, title, content]);
        connection.release();
        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ success: false, error: 'Erro ao criar a nota. Por favor, tente novamente.' });
    }
});

app.get('/pegarNotas', ensureAuthenticated, async (req, res) => {
    const user_id = req.session.user_id;
    try {
        const connection = await conexao.connect();
        const selectNotes = "SELECT * FROM public.notes WHERE user_id = $1";
        const result = await connection.query(selectNotes, [user_id]);
        connection.release();

        // Enviar as notas recuperadas como resposta
        res.json(result.rows);
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: 'Erro ao recuperar as notas. Por favor, tente novamente.' });
    }
});


app.post('/atualizarNota', ensureAuthenticated, async (req, res) => {
    const { id, title, content } = req.body;
    try {
        const connection = await conexao.connect();
        const updateNote = "UPDATE public.notes SET title = $1, content = $2 WHERE id = $3";
        await connection.query(updateNote, [title, content, id]);
        connection.release();
        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ success: false, error: 'Erro ao atualizar a nota. Por favor, tente novamente.' });
    }
});

app.post('/deletarNota', ensureAuthenticated, async (req, res) => {
    const { id } = req.body;
    try {
        const connection = await conexao.connect();
        const deleteNote = "DELETE FROM public.notes WHERE id = $1";
        await connection.query(deleteNote, [id]);
        connection.release();
        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ success: false, error: 'Erro ao deletar a nota. Por favor, tente novamente.' });
    }
});

app.listen(3000,function (){
    console.log("Rodando na porta 3000")
})
  