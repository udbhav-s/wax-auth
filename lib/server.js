"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaxAuthServer = void 0;
var eosjs_jssig_1 = require("eosjs/dist/eosjs-jssig");
var blakejs_1 = require("blakejs");
var crypto_1 = require("crypto");
var eosjs_1 = require("eosjs");
var node_fetch_1 = __importDefault(require("node-fetch"));
var bytesToHex = function (bytes) {
    return Array.prototype.map
        .call(bytes, function (x) { return ('00' + x.toString(16)).slice(-2); })
        .join('')
        .toUpperCase();
};
var getInt64StrFromUint8Array = function (ba) {
    var hex = bytesToHex(ba);
    var bi = BigInt('0x' + hex);
    var max = BigInt('0x7FFFFFFFFFFFFFFF');
    return (bi % max).toString();
};
var WaxAuthServer = /** @class */ (function () {
    function WaxAuthServer(rpcUrl, chainId) {
        this.chainId = '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4';
        this.endpoint = new eosjs_1.JsonRpc(rpcUrl !== null && rpcUrl !== void 0 ? rpcUrl : 'https://wax.greymass.com', { fetch: node_fetch_1.default });
        var signatureProvider = new eosjs_jssig_1.JsSignatureProvider([]);
        this.api = new eosjs_1.Api({ rpc: this.endpoint, signatureProvider: signatureProvider });
        if (chainId)
            this.chainId = chainId;
    }
    WaxAuthServer.prototype.generateNonce = function () {
        var nonce = blakejs_1.blake2b(crypto_1.randomBytes(32), undefined, 32);
        return getInt64StrFromUint8Array(nonce);
    };
    WaxAuthServer.prototype.verifyNonce = function (_a) {
        var waxAddress = _a.waxAddress, nonce = _a.nonce, transaction = _a.transaction;
        return __awaiter(this, void 0, void 0, function () {
            var arr, key, uarr, buf, data, recoveredKeys, claimedUser, claimedUserKeys_1, match_1, actions, action, transactionNonce;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        arr = [];
                        for (key in transaction.serializedTransaction) {
                            arr.push(transaction.serializedTransaction[key]);
                        }
                        uarr = new Uint8Array(arr);
                        buf = Buffer.from(uarr);
                        data = Buffer.concat([
                            Buffer.from(this.chainId, 'hex'),
                            buf,
                            Buffer.from(new Uint8Array(32)),
                        ]);
                        recoveredKeys = [];
                        transaction.signatures.forEach(function (sigstr) {
                            var sig = eosjs_jssig_1.Signature.fromString(sigstr);
                            recoveredKeys.push(eosjs_jssig_1.PublicKey.fromString(sig.recover(data).toString()).toLegacyString());
                        });
                        return [4 /*yield*/, this.endpoint.get_account(waxAddress)];
                    case 1:
                        claimedUser = _b.sent();
                        if (!(claimedUser === null || claimedUser === void 0 ? void 0 : claimedUser.permissions)) return [3 /*break*/, 3];
                        claimedUserKeys_1 = [];
                        claimedUser.permissions.forEach(function (perm) {
                            perm.required_auth.keys.forEach(function (obj) { return claimedUserKeys_1.push(obj.key); });
                        });
                        match_1 = false;
                        recoveredKeys.forEach(function (rk) {
                            claimedUserKeys_1.forEach(function (ck) {
                                if (rk == ck)
                                    match_1 = true;
                            });
                        });
                        if (!match_1) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.api.deserializeActions(this.api.deserializeTransaction(uarr).actions)];
                    case 2:
                        actions = _b.sent();
                        action = actions.find(function (a) { return a.name === 'requestrand'; });
                        if (!action)
                            return [2 /*return*/, false];
                        transactionNonce = action.data.assoc_id;
                        if (nonce !== transactionNonce) {
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, true];
                    case 3: return [2 /*return*/, false];
                }
            });
        });
    };
    return WaxAuthServer;
}());
exports.WaxAuthServer = WaxAuthServer;
