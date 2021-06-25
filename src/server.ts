import { Signature, PublicKey, JsSignatureProvider } from "eosjs/dist/eosjs-jssig";
import { blake2b } from "blakejs";
import { randomBytes } from "crypto";
import { Api, JsonRpc } from "eosjs";
import fetch from "node-fetch";

interface NonceVerificationParams {
  waxAddress: string;
  proof: any;
}

const bytesToHex = (bytes: Uint8Array) => {
  return Array.prototype.map
    .call(bytes, (x) => ('00' + x.toString(16)).slice(-2))
    .join('')
    .toUpperCase();
};
const getInt64StrFromUint8Array = (ba: Uint8Array) => {
  const hex = bytesToHex(ba);
  const bi = BigInt('0x' + hex);
  const max = BigInt('0x7FFFFFFFFFFFFFFF');
  return (bi % max).toString();
};

export class InvalidProofError extends Error {
  message = "Invalid proof body";
}

export class WaxAuthServer {
  endpoint: JsonRpc;
  api: Api;
  chainId: string = '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4';

  constructor(rpcUrl?: string, chainId?: string) {
    this.endpoint = new JsonRpc(rpcUrl ?? 'https://wax.greymass.com', { fetch });
    const signatureProvider = new JsSignatureProvider([]);
    this.api = new Api({ rpc: this.endpoint, signatureProvider });
    if (chainId) this.chainId = chainId;
  }

  generateNonce(): string {
    const nonce = blake2b(randomBytes(32), undefined, 32);
    return getInt64StrFromUint8Array(nonce);
  }

  async verifyNonce({
    waxAddress,
    proof,
  }: NonceVerificationParams): Promise<boolean> {
    if (!proof.transaction || !proof.transaction.signatures.length || !proof.transaction.serializedTransaction || !proof.nonce) {
      throw new InvalidProofError();
    }
    // make buffer from transaction
    const arr = [];
    for (const key in proof.transaction.serializedTransaction) {
      arr.push(proof.transaction.serializedTransaction[key]);
    }
    const uarr = new Uint8Array(arr);
    const buf = Buffer.from(uarr);

    const data = Buffer.concat([
      Buffer.from(this.chainId, 'hex'),
      buf,
      Buffer.from(new Uint8Array(32)),
    ]);

    const recoveredKeys: string[] = [];
    proof.transaction.signatures.forEach((sigstr: string) => {
      const sig = Signature.fromString(sigstr);
      recoveredKeys.push(
        PublicKey.fromString(sig.recover(data).toString()).toLegacyString(),
      );
    });

    const claimedUser = await this.endpoint.get_account(waxAddress);
    if (claimedUser?.permissions) {
      const claimedUserKeys: string[] = [];
      claimedUser.permissions.forEach((perm) => {
        perm.required_auth.keys.forEach((obj) => claimedUserKeys.push(obj.key));
      });

      let match = false;
      recoveredKeys.forEach((rk) => {
        claimedUserKeys.forEach((ck) => {
          if (rk == ck) match = true;
        });
      });
      if (!match) {
        return false;
      }

      const actions = await this.api.deserializeActions(
        this.api.deserializeTransaction(uarr).actions,
      );
      const action = actions.find((a) => a.name === 'requestrand');
      if (!action) return false;
      const transactionNonce = action.data.assoc_id;

      if (proof.nonce !== transactionNonce) {
        return false;
      }

      return true;
    } else return false;
  }
}