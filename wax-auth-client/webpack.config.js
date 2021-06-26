module.exports = {
  entry: "./lib/index.js",
  resolve: {
    fallback: {
      crypto: false,
    }
  }
};