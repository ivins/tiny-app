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
  b2xVn2: {
    longUrl: 'http://www.lighthouselabs.ca',
    userID: 'SteveJackson'
  },
  '9sm5xK': {
    longUrl: 'http://www.google.com',
    userID: 'BobJackson'
  }
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
    user: users[req.cookies['user_id']]
  };
  res.render('urls_index', templateVars);
});

// For adding a new URL
app.get('/urls/new', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  if (req.cookies['user_id']) {
    res.render('urls_new', templateVars);
  } else {
    res.render('login', templateVars);
  }
});

// shows the specified URL short and long and offers option to update if desired.
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: req.cookies['user_id']
  };
  res.render('urls_show', templateVars);
});

// Adds new url, assigns random id/short url and adds it to the database. Otherwise fires error.
app.post('/urls', (req, res) => {
  const httpCheck = req.body.longURL.slice(0, 7);
  const templateVars = {
    user: users[req.cookies['user_id']]
  };
  if (httpCheck === 'http://') {
    const id = generateRandomString();
    urlDatabase[id] = {
      longUrl: req.body.longURL,
      userID: req.cookies['user_id']
    };
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
  if (req.cookies['user_id'] === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect(`http://localhost:8080/urls`);
  } else {
    res.redirect(`http://localhost:8080/urls`);
  }
});

// when a URL is updated/changed this is activated.
app.post('/urls/:id', (req, res) => {
  const newURL = req.body.updatedURL;
  const shortURL = req.params.id;
  const httpCheck = newURL.slice(0, 7);
  if (req.cookies['user_id'] === urlDatabase[shortURL].userID) {
    if (httpCheck === 'http://') {
      const id = req.params.id;
      urlDatabase[id].longUrl = newURL;
      res.redirect(`http://localhost:8080/urls`);
    } else {
      res.status(400).send({ Error: 'URL should start with http://  try again' });
    }
  } else {
    res.status(400).send({ Error: 'Not authorized to delete this URL' });
  }
});

// request which returns the registration page
app.get('/register', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };

  res.render('register', templateVars);
});

// User submits a request to register a new user
app.post('/register', (req, res) => {
  let exists = userExists(req.body.email);
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
    res.cookie('user_id', id);
    res.redirect(`http://localhost:8080/urls`);
  }
});

// user logs in and cookie gets set. -------no longer in use
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const exists = userExists(req.body.email);
  const userVerified = userId(exists);
  const templateVars = {
    urls: urlDatabase,
    user: users[userVerified]
  };
  if (exists) {
    if (req.body.password === users[userVerified].password) {
      res.cookie('user_id', userVerified);
      res.redirect(`http://localhost:8080/urls`);
    } else {
      res.status(400).send({ Error: 'Password incorrect' });
    }
  } else {
    res.status(400).send({ Error: 'Email is not recoqnized' });
  }
});

// receiving a request to log out. Clears cookies then sends them back to urls page.
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`http://localhost:8080/login`);
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

function userId (reqEmail) {
  // console.log('req email: ', reqEmail);
  let user = '';
  Object.keys(users).filter(function (key) {
    if (users[key].email === reqEmail) {
      user = users[key].id;
      return users[key].id;
    }
  });
  return user;
}
// console.log(users);
// userId('steve@example.com');
