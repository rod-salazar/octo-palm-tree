module.exports = {
  presets: ['module:metro-react-native-babel-preset', "@babel/preset-flow"],
  "plugins": [
    [
      "module-resolver",
      {
        "cwd": "babelrc",
        "root": ["./src"],
        "extensions": [".js"],
        "alias": {
          "@utils": "./src/utils",
        }
      }
    ]
  ]
};
