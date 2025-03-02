const createExpoWebpackConfigAsync = require("@expo/webpack-config");
const path = require("path");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          "@expo/webpack-config/web-default/index.html",
        ],
      },
      template: {
        templatePath: path.resolve(__dirname, "web/index.html"),
      },
    },
    argv
  );

  // Add polyfills for web
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
  };

  // Customize the config before returning it
  if (config.devServer) {
    // Use the new configuration style
    config.devServer = {
      ...config.devServer,
      setupMiddlewares: (middlewares, devServer) => {
        if (!devServer) {
          throw new Error("webpack-dev-server is not defined");
        }
        return middlewares;
      },
    };
  }

  return config;
};
