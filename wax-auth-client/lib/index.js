"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaxAuthClient = exports.TransactionNotSignedError = void 0;
const waxjs = __importStar(require("@waxio/waxjs/dist"));
const eosjs_1 = require("eosjs");
const eosjs_jssig_1 = require("eosjs/dist/eosjs-jssig");
const anchor_link_1 = __importDefault(require("anchor-link"));
const anchor_link_browser_transport_1 = __importDefault(require("anchor-link-browser-transport"));
class TransactionNotSignedError extends Error {
    constructor() {
        super(...arguments);
        this.message = "Error while signing transaction";
    }
}
exports.TransactionNotSignedError = TransactionNotSignedError;
class WaxAuthClient {
    constructor(tryAutoLogin = undefined, rpcUrl, chainId) {
        this.waxAddress = "";
        // wax
        this.wax = new waxjs.WaxJS(rpcUrl !== null && rpcUrl !== void 0 ? rpcUrl : "https://wax.greymass.com", undefined, tryAutoLogin, false);
        // eos api
        this.eosEndpoint = new eosjs_1.JsonRpc(rpcUrl !== null && rpcUrl !== void 0 ? rpcUrl : "https://wax.greymass.com", { fetch: window.fetch });
        const signatureProvider = new eosjs_jssig_1.JsSignatureProvider([]);
        this.eosApi = new eosjs_1.Api({ rpc: this.eosEndpoint, signatureProvider });
        // anchor
        const transport = new anchor_link_browser_transport_1.default();
        this.link = new anchor_link_1.default({
            transport,
            chains: [
                {
                    chainId: chainId !== null && chainId !== void 0 ? chainId : "1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4",
                    nodeUrl: rpcUrl !== null && rpcUrl !== void 0 ? rpcUrl : "https://wax.greymass.com",
                },
            ],
        });
    }
    loginWax() {
        return __awaiter(this, void 0, void 0, function* () {
            const waxAddress = yield this.wax.login();
            if (!waxAddress)
                throw new Error("Could not log in");
            this.waxAddress = waxAddress;
            return waxAddress;
        });
    }
    loginAnchor() {
        return __awaiter(this, void 0, void 0, function* () {
            const identity = yield this.link.login("MonkeyBattle");
            this.linkSession = identity.session;
            this.waxAddress = identity.session.auth.actor.toString();
            return this.waxAddress;
        });
    }
    getTransactionData(nonce) {
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
    getProofWax(nonce) {
        return __awaiter(this, void 0, void 0, function* () {
            const txData = this.getTransactionData(nonce);
            const transaction = yield this.wax.api.transact(txData.data, txData.options);
            if (!transaction.signatures[0]) {
                throw new TransactionNotSignedError();
            }
            return transaction;
        });
    }
    getProofAnchor(nonce) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.linkSession)
                throw new Error("Link Session not defined");
            const txData = this.getTransactionData(nonce);
            const tx = yield this.linkSession.transact(txData.data, txData.options);
            return {
                serializedTransaction: this.eosApi.serializeTransaction(JSON.parse(JSON.stringify(tx.transaction))),
                signatures: tx.signatures,
            };
        });
    }
}
exports.WaxAuthClient = WaxAuthClient;
