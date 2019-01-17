const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');

// Example URL Database
const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = {
  BobJackson: {
    id: 'BobJackson',
    email: 'bob@example.com',
    password: 'b123'
  },
  SteveJackson: {
    id: 'SteveJackson',
    email: 'steve@example.com',
    password: 's123'
  }
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

// Sends the URL database and username to the index page
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['username']
  };
  res.render('urls_index', templateVars);
});

// For adding a new URL
app.get('/urls/new', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['username']
  };
  res.render('urls_new', templateVars);
});

// shows the specified URL short and long and offers option to update if desired.
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies['username']
  };
  res.render('urls_show', templateVars);
});

// Adds new url, assigns random id/short url and adds it to the database. Otherwise fires error.
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

// redirect platform for shortened URLS
app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });

// when a request to delete a url this is activated.
app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect(`http://localhost:8080/urls`);
});

// when a URL is updated/changed this is activated.
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

// request which returns the registration page
app.get('/register', (req, res) => {
  const templateVars = {
    username: req.cookies['username']
  };
  res.render('register', templateVars);
});

// User submits a request to register a new user
app.post('/register', (req, res) => {
  let exists = userExists(req.body.email);
  console.log('Exists: ', exists);
  if (!req.body.email || !req.body.password) {
    res.status(400).send({ Error: 'Username/Password fields cannot be empty' });
  } else if (exists) {
    res.status(400).send({ Error: 'An account exists for this username. Try Registering Again' });
  } else {
    const id = generateRandomString();
    users[id] = {
      id: id,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('username', users[id].id);
    res.redirect(`http://localhost:8080/urls`);
  }
});

// user logs in and cookie gets set.
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect(`http://localhost:8080/urls`);
});

// receiving a request to log out. Clears cookies then sends them back to urls page.
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect(`http://localhost:8080/urls`);
});

// Starts the server and listens for requests on specified port.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// generates a random string for Short URL.
function generateRandomString () {
  const charOptions = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomString = '';
  for (let i = 0; i < 6; i += 1) {
    randomString += charOptions[Math.floor(Math.random() * charOptions.length)];
  }
  return randomString;
}

function userExists (reqEmail) {
  // console.log('req email: ', reqEmail);
  let user = '';
  Object.keys(users).filter(function (key) {
    if (users[key].email === reqEmail) {
      user = users[key].email;
      return users[key].email;
    }
  });
  return user;
}

// userExists('steve@example.com');
