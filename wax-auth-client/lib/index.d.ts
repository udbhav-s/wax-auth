import { WaxJS } from "@waxio/waxjs/dist";
import { Api, JsonRpc } from "eosjs";
import AnchorLink, { LinkSession, Signature, TransactResult } from "anchor-link";
export interface ProofTransaction {
    serializedTransaction: Uint8Array;
    signatures: Signature[];
    transaction?: TransactResult;
}
export declare class TransactionNotSignedError extends Error {
    message: string;
}
export declare class WaxAuthClient {
    wax: WaxJS;
    link: AnchorLink;
    linkSession: LinkSession | undefined;
    eosEndpoint: JsonRpc;
    eosApi: Api;
    waxAddress: string;
    constructor(tryAutoLogin?: boolean | undefined, rpcUrl?: string, chainId?: string);
    loginWax(): Promise<string>;
    loginAnchor(appName?: string): Promise<string>;
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
    getProofAnchor(nonce: string, withTx?: boolean): Promise<ProofTransaction>;
}
