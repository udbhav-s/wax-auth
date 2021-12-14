const express = require('express');
const session = require('express-session');
const { WaxAuthServer } = require('wax-auth');

const auth = new WaxAuthServer();

const app = express();

app.use(express.static('static'));
app.use(session({
	secret: 'secret'
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/home', (req, res) => {
	if (!req.session.loggedIn) {
		res.send({ error: "Not logged in" });
		return;
	}
	res.sendFile('static/home.html', { root: __dirname });
});

// auth flow
app.post('/getNonce', (req, res) => {
	const { waxAddress } = req.body;
	if (!waxAddress ) {
		res.send({
			error: "No username"
		});
		return;
	}

  // generate a nonce for the user and store it in session
  const nonce = auth.generateNonce();
  req.session.waxAddress = waxAddress;
  req.session.nonce = nonce;

  // send the nonce to the client
	res.send({
		nonce
	});
});

app.post('/verify', (req, res) => {
  // retreive 
	if (!req.session.nonce || !req.session.waxAddress || !req.body.proof) {
		res.send({
			error: "Please log in again"
		});
		return;
	}

  // verify proof
  try {
    const valid = auth.verifyNonce({
      waxAddress: req.session.waxAddress,
      proof: req.body.proof,
      nonce: req.session.nonce
    });

    if (valid) {
      req.session.loggedIn = true;
      res.redirect('/home');
    } else {
      res.send({ error: "Login failed, please try again"});
    }
  } catch(e) {
    res.send({
      error: "Invalid proof, please try again"
    });
  }
});

app.get('/user', (req, res) => {
	if (!req.session.loggedIn) {
		res.send({ error: "Not logged in" });
		return;
	} else {
		res.send({
			user: req.session.waxAddress
		});
	}
});

// routes
app.get('/', (req, res) => {
  res.sendFile('static/index.html', { root: __dirname });
});

app.listen(process.env.PORT || 3000, () => console.log("App running"));