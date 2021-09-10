import * as waxjs from "@waxio/waxjs/dist";
import { Api, JsonRpc } from "eosjs";
import { JsSignatureProvider } from "eosjs/dist/eosjs-jssig";
import AnchorLink, { LinkSession, Signature, TransactResult } from "anchor-link";
import AnchorLinkBrowserTransport from "anchor-link-browser-transport";

export interface ProofTransaction {
  serializedTransaction: Uint8Array;
  signatures: Signature[];
  transaction?: TransactResult;
}

export class TransactionNotSignedError extends Error {
  message = "Error while signing transaction";
}

export class WaxAuthClient {
  wax: waxjs.WaxJS;
  link: AnchorLink;
  linkSession: LinkSession | undefined;
  eosEndpoint: JsonRpc;
  eosApi: Api;
  waxAddress: string = "";

  constructor(tryAutoLogin: string[] | undefined = undefined, rpcUrl?: string, chainId?: string) {
    // wax
    this.wax = new waxjs.WaxJS(
      rpcUrl ?? "https://wax.greymass.com",
      undefined,
      tryAutoLogin,
      false
    );

    // eos api
    this.eosEndpoint = new JsonRpc(rpcUrl ?? "https://wax.greymass.com", { fetch: window.fetch });
    const signatureProvider = new JsSignatureProvider([]);
    this.eosApi = new Api({ rpc: this.eosEndpoint, signatureProvider });

    // anchor
    const transport = new AnchorLinkBrowserTransport();
    this.link = new AnchorLink({
      transport,
      chains: [
        {
          chainId:
            chainId ?? "1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4",
          nodeUrl: rpcUrl ?? "https://wax.greymass.com",
        },
      ],
    });
  }

  async loginWax(): Promise<string> {
    const waxAddress = await this.wax.login() as string;
    if (!waxAddress) throw new Error("Could not log in");
    this.waxAddress = waxAddress;
    return waxAddress;
  }

  async loginAnchor(appName?: string): Promise<string> {
    const identity = await this.link.login(appName ?? "Login");
    this.linkSession = identity.session;
    this.waxAddress = identity.session.auth.actor.toString()
    return this.waxAddress;
  }

  getTransactionData(nonce: string) {
    return {
      data: {
        actions: [
          {
            account: "orng.wax",
            name: "requestrand",
            authorization: [
              {
                actor: this.waxAddress,
                permission: "active",
              },
            ],
            data: {
              caller: this.waxAddress,
              signing_value: nonce,
              assoc_id: nonce,
            },
          },
        ],
      },
      options: {
        blocksBehind: 3,
        expireSeconds: 30,
        broadcast: false,
        sign: true,
      },
    };
  }

  async getProofWax(nonce: string): Promise<ProofTransaction> {
    const txData = this.getTransactionData(nonce);
    const transaction = await this.wax.api.transact(
      txData.data,
      txData.options
    );

    if (!transaction.signatures[0]) {
      throw new TransactionNotSignedError();
    }

    return transaction;
  }

  async getProofAnchor(nonce: string, withTx?: boolean): Promise<ProofTransaction> {
    if (!this.linkSession) throw new Error("Link Session not defined");
    const txData = this.getTransactionData(nonce);
    const tx = await this.linkSession.transact(txData.data, txData.options);

    return {
      serializedTransaction: this.eosApi.serializeTransaction(
        JSON.parse(JSON.stringify(tx.transaction))
      ),
      signatures: tx.signatures,
      transaction: withTx ? tx : undefined,
    };
  }
}