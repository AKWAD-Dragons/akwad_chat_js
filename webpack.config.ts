import { Configuration } from "webpack";
import { resolve } from "node:path";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";

let config: Configuration = {
  mode: (process.env.NODE_ENV || "none") as any,
  target: "node",
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
    symlinks: false,
    plugins: [new TsconfigPathsPlugin()],
  },

  output: {
    path: resolve(__dirname, "./dist"),
    filename: "[name].js",
    library: {
      type: "commonjs2",
    },
    clean: true,
  },
  experiments: {
    topLevelAwait: true,
  },
  module: {
    noParse: /[\/\\]native-require.js$/,
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          compilerOptions: {
            sourceMap: false,
          },
          onlyCompileBundledFiles: true,
          configFile: resolve(__dirname, "./tsconfig.json"),
        },
      },
    ],
  },
};

export default config;
