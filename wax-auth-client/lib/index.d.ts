export declare class WaxAuthClient {
    getTransactionData(nonce: string, waxAddress: string): {
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
}
