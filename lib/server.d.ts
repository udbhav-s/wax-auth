import { Api, JsonRpc } from "eosjs";
interface NonceVerificationParams {
    waxAddress: string;
    nonce: string;
    transaction: any;
}
export declare class WaxAuthServer {
    endpoint: JsonRpc;
    api: Api;
    chainId: string;
    constructor(rpcUrl?: string, chainId?: string);
    generateNonce(): string;
    verifyNonce({ waxAddress, nonce, transaction, }: NonceVerificationParams): Promise<boolean>;
}
export {};
