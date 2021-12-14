# wax-auth
Fast, costless authentication flow for the Wax blockchain. Supports Wax Cloud Wallet and Anchor.

`wax-auth` allows you to implement an OAuth-like authentication flow for your app. This is useful for apps where the server needs to verify the identity of the user. Authentication works by making the user sign a requestrand transaction with a nonce generated by the server. This is not pushed to the chain and instead can be sent back to the server which verifies the signature and validates the identity of the user.  

The wax-auth-client package returns a transaction body that can be signed using UAL or through individual wallet libraries.

This package is experimental and is not recommended for critical production use cases.

# Example usage:  
For a complete example, check [here](https://github.com/udbhav-s/wax-auth/tree/main/demo)  

## Server  
```js
const { WaxAuthServer } = require('wax-auth');
const auth = new WaxAuthServer();

// ...

app.post('/getNonce', (req, res) => {
  const { waxAddress } = req.body;

  const nonce = auth.generateNonce();
  req.session.waxAddress = waxAddress;
  req.session.nonce = nonce;

  res.send({
    nonce
  });
});

app.post('/verify', (req, res) => {
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
});
```

## Client
```js
import { WaxAuthClient } from "wax-auth-client";
const auth = new WaxAuthClient();

// get loggedInUser from UAL

const waxAddress = await loggedInUser.getAccountName();
const { nonce } = await post("/getNonce", { waxAddress });

const tx = auth.getTransactionData(nonce, waxAddress);
const proof = await loggedInUser.signTransaction(tx.data, tx.options);

await post("/verify", { proof });
// Logged in!
```

# Installation

### Server (Node)
`npm install wax-auth`  
### Client (webpack recommended)
`npm install wax-auth-client`  

# Methods
### WaxAuthServer
`new WaxAuthServer(rpcUrl?: string, chainId?: string)`  
`generateNonce(): string`: generates a random nonce for the client  
`async verifyNonce({ waxAddress, proof, nonce }: NonceVerificationParams): Promise<boolean>`: verifies a nonce  

### WaxAuthClient
`async getTransactionData(nonce: string, waxAddress: string)`: Returns transaction data and options to sign for verification
