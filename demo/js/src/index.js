import { TransactionNotSignedError, WaxAuthClient } from "wax-auth-client";

let nonce;
let waxAddress;
let loginMethod;

window.onload = () => {
  const auth = new WaxAuthClient();

  const waxButton = document.getElementById("loginWax");
  const anchorButton = document.getElementById("loginAnchor");

  const loginWax = async () => {
    waxAddress = await auth.loginWax();
    loginMethod = "wax";
    getNonce();
  }
  waxButton.onclick = loginWax;

  const loginAnchor = async () => {
    waxAddress = await auth.loginAnchor();
    loginMethod = "anchor";
    getNonce();
  }
  anchorButton.onclick = loginAnchor;

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

    waxButton.style.display = "none";
    anchorButton.style.display = "none";
    // make verify button visible
    document.getElementById("verify").style.display = "inline-block";
  }

  const verify = async () => {
    if (!nonce || !loginMethod) return;

    let proof;

    try {
      if (loginMethod === "wax") proof = await auth.getProofWax(nonce);
      else proof = await auth.getProofAnchor(nonce);
    } catch (e) {
      if (e instanceof TransactionNotSignedError)
        alert("Transaction was not signed, please try again");
      return;
    }

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
    }
  }
  document.getElementById("verify").onclick = verify;
}