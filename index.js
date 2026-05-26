const { onRequest } = require("firebase-functions/v2/https");
const { app } = require("./dist/server.cjs");

exports.api = onRequest(app);