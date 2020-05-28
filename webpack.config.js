const path = require("path");
const nodeExternals = require("webpack-node-externals");
const WebpackShellPlugin = require("webpack-shell-plugin");

const { NODE_ENV = "production" } = process.env;

console.log(NODE_ENV);

module.exports = (env, args) => {
  const usePlugins = [];
  if (process.env.NODE_ENV === "development") {
    usePlugins.push(
      new WebpackShellPlugin({
        onBuildEnd: ["yarn doc","yarn run:dev"],
      })
    );
  }
  return {
    entry: "./src/index.ts",
    mode: NODE_ENV,
    target: "node",
    watch: NODE_ENV === "development",
    externals: [nodeExternals()],
    output: {
      path: path.resolve(__dirname, "build"),
      filename: "index.js",
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    watch: NODE_ENV === "development",
    plugins: usePlugins,
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: ["ts-loader"],
        },
      ],
    },
  };
};
