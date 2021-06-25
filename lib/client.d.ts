import * as waxjs from "@waxio/waxjs/dist";
import { Api, JsonRpc } from "eosjs";
import AnchorLink, { LinkSession, Signature } from "anchor-link";
export interface ProofTransaction {
    transaction: {
        serializedTransaction: Uint8Array;
        signatures: Signature[];
    };
}
export declare class TransactionNotSignedError extends Error {
    message: string;
}
export declare class WaxAuthClient {
    wax: waxjs.WaxJS;
    link: AnchorLink;
    linkSession: LinkSession | undefined;
    eosEndpoint: JsonRpc;
    eosApi: Api;
    waxAddress: string;
    constructor(tryAutoLogin?: string[] | undefined, rpcUrl?: string, chainId?: string);
    loginWax(): Promise<string>;
    loginAnchor(): Promise<string>;
    getTransactionData(nonce: string): {
        data: {
            actions: {
                account: string;
                name: string;
                authorization: {
                    actor: string;
                    permission: string;
                }[];
                data: {
                    caller: string;
                    signing_value: string;
                    assoc_id: string;
                };
            }[];
        };
        options: {
            blocksBehind: number;
            expireSeconds: number;
            broadcast: boolean;
            sign: boolean;
        };
    };
    getProofWax(nonce: string): Promise<ProofTransaction>;
    getProofAnchor(nonce: string): Promise<ProofTransaction>;
}
