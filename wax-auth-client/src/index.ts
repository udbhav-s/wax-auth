export class WaxAuthClient {
  getTransactionData(nonce: string, waxAddress: string) {
    return {
      data: {
        actions: [
          {
            account: "orng.wax",
            name: "requestrand",
            authorization: [
              {
                actor: waxAddress,
                permission: "active",
              },
            ],
            data: {
              caller: waxAddress,
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
}