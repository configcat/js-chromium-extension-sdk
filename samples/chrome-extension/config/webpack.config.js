"use strict";

const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

const PATHS = {
  src: path.resolve(__dirname, "../src"),
  build: path.resolve(__dirname, "../build"),
};

const IMAGE_TYPES = /\.(png|jpe?g|gif|svg)$/i;

const config = (_env, argv) => {
  const isProd = argv.mode === "production";
  return {
    output: {
      path: PATHS.build,
      filename: "[name].js",
    },
    entry: {
      main: PATHS.src + "/main.js",
    },
    stats: {
      all: false,
      errors: true,
      builtAt: true,
      assets: true,
      excludeAssets: [IMAGE_TYPES],
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
        {
          test: IMAGE_TYPES,
          use: [
            {
              loader: "file-loader",
              options: {
                outputPath: "images",
                name: "[name].[ext]",
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "**/*",
            context: "public",
          },
        ],
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),
    ],

    resolve: {
      modules: ["src", "node_modules"],
    },

    devtool: isProd ? false : "inline-source-map",

    optimization: {
      minimize: isProd,
    },
  };
};

module.exports = config;
