"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  generateOtp: () => generateOtp,
  loadConfig: () => loadConfig
});
module.exports = __toCommonJS(index_exports);

// src/config/index.ts
var loadConfig = (overrides = {}) => ({
  port: overrides.port ?? Number(process.env.PORT ?? 3e3),
  host: overrides.host ?? process.env.HOST ?? "localhost",
  securityEnabled: overrides.securityEnabled ?? true,
  useTls: overrides.securityEnabled ?? process.env.USE_TLS !== "false",
  certPath: process.env.CERT_PATH,
  keyPath: process.env.KEY_PATH,
  otp: overrides.otp,
  tokenTtl: overrides.tokenTtl ?? 300,
  keysDir: overrides.keysDir ?? ".reditor/keys",
  jwtPrivateKey: overrides.jwtPrivateKey,
  jwtPublicKey: overrides.jwtPublicKey,
  file: overrides.file ?? ""
});

// src/core/security/otp.ts
var import_crypto = require("crypto");
var generateOtp = () => String((0, import_crypto.randomInt)(1e5, 999999));

// src/core/security/jwt.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateOtp,
  loadConfig
});
