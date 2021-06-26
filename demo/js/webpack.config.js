const path = require("path");

module.exports = {
  resolve: {
    fallback: {
      crypto: false,
    }
  },
  output: {
    path: path.join(__dirname, "../static/js"),
    filename: "index.js",
  }
};