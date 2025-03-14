module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo", "@babel/preset-react"],
    plugins: [
      [
        "@babel/plugin-transform-react-jsx",
        {
          throwIfNamespace: false,
          runtime: "automatic",
        },
      ],
    ],
  };
};
