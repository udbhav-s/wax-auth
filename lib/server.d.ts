import { Api, JsonRpc } from "eosjs";
interface NonceVerificationParams {
    waxAddress: string;
    proof: {
        transaction: any;
    };
    nonce: string;
}
export declare class InvalidProofError extends Error {
    message: string;
}
export declare class WaxAuthServer {
    endpoint: JsonRpc;
    api: Api;
    chainId: string;
    constructor(rpcUrl?: string, chainId?: string);
    generateNonce(): string;
    verifyNonce({ waxAddress, proof, nonce }: NonceVerificationParams): Promise<boolean>;
}
export {};
