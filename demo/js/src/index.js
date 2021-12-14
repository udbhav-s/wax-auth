import { WaxAuthClient } from "wax-auth-client";
import { Anchor } from "ual-anchor";
import { Wax } from "@eosdacio/ual-wax";
import { UALJs } from "ual-plainjs-renderer";

const auth = new WaxAuthClient();

let nonce;
let loggedInUser;
let waxAddress;

const waxChain = {
  chainId: "1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4",
  rpcEndpoints: [{
    protocol: "https",
    host: "wax.greymass.com",
    port: "443",
  }]
};

const userCallback = async (users) => {
  loggedInUser = users[0];
  waxAddress = await loggedInUser.getAccountName();

  getNonce();
}

const getNonce = async () => {
  let response = await fetch('/getNonce', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      waxAddress
    })
  });

  nonce = (await response.json()).nonce;

  // make verify button visible
  document.getElementById("ual-div").style.display = "none";
  document.getElementById("verify").style.display = "inline-block";
}

const verify = async () => {
  if (!nonce) return;

  const tx = auth.getTransactionData(nonce, waxAddress);
  const result = await loggedInUser.signTransaction(tx.data, tx.options);

  const proof = { 
    serializedTransaction: result.transaction.serializedTransaction,
    signatures: result.transaction.signatures
  };

  try {
    await fetch('/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        proof
      })
    });

    window.location.href = "/home";
  } catch (e) {
    alert("Login failed");
    throw e;
  }
}

window.onload = () => {
  const anchor = new Anchor([waxChain], { appName: "wax-auth-demo" });
  const wax = new Wax([waxChain]);

  const ual = new UALJs(
    userCallback,
    [waxChain],
    "Wax Auth Demo",
    [anchor, wax],
    {
      containerElement: document.getElementById("ual-div"),
    }
  );
  ual.init();

  document.getElementById("verify").onclick = verify;
}