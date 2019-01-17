const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['username']
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['username']
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies['username']
  };
  res.render('urls_show', templateVars);
});

app.post('/urls', (req, res) => {
  const httpCheck = req.body.longURL.slice(0, 7);
  const templateVars = {
    username: req.cookies['username']
  };
  if (httpCheck === 'http://') {
    const id = generateRandomString();
    urlDatabase[id] = req.body.longURL;
    res.redirect(`http://localhost:8080/urls/${id}`);
  } else {
    res.render('urls_error', templateVars);
  }
});

app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });

app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect(`http://localhost:8080/urls`);
});

app.post('/urls/:id', (req, res) => {
  const newURL = req.body.updatedURL;
  const httpCheck = newURL.slice(0, 7);
  if (httpCheck === 'http://') {
    const id = req.params.id;
    urlDatabase[id] = newURL;
    res.redirect(`http://localhost:8080/urls`);
  } else {
    res.redirect(`http://localhost:8080/urls`);
  }
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect(`http://localhost:8080/urls`);
});

app.post('/logout', (req, res) => {
  res.clearCookie(req.cookies.username);
  res.redirect(`http://localhost:8080/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString () {
  const charOptions = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomString = '';
  for (let i = 0; i < 6; i += 1) {
    randomString += charOptions[Math.floor(Math.random() * charOptions.length)];
  }
  return randomString;
}

