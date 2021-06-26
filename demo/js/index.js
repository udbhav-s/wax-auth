const { WaxAuthClient } = require("wax-auth");

let nonce;
let waxAddress;
let loginMethod;

window.onload = () => {
  const auth = new WaxAuthClient();

  const loginWax = async () => {
    waxAddress = await auth.loginWax();
    loginMethod = "wax";
    getNonce();
  }
  document.getElementById("loginWax").onclick = loginWax;

  const loginAnchor = async () => {
    waxAddress = auth.loginAnchor();
    loginMethod = "anchor";
    getNonce();
  }
  document.getElementById("loginAnchor").onclick = loginAnchor;

  const getNonce = async () => {
    let response = await fetch('/getNonce', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        waxAddress
      }
    });

    nonce = (await response.json()).nonce;

    // make verify button visible
    document.getElementById("verify").style.display = "inline-block";
  }

  const verify = async () => {
    if (!nonce || !loginMethod) return;

    let proof;
    if (loginMethod === "wax") proof = auth.getProofWax(nonce);
    else proof = auth.getProofAnchor(nonce);

    fetch('/verifyNonce', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        proof
      }
    });
  }
  document.getElementById("verify").onclick = "verify";
}