const HtmlWebpackPlugin = require("html-webpack-plugin"),
  { resolve } = require("path");

module.exports = {
  mode: "development",
  entry: "./src/run.js",
  output: {
    path: resolve(__dirname, "dist"),
    filename: "bundle.js",
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(__dirname, "./src/index.html"),
    }),
  ],
  devtool: "eval-cheap-module-source-map",
};
