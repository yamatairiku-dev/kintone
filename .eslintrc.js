module.exports = {
  extends: ['@cybozu/eslint-config/presets/node', '@cybozu/eslint-config/globals/kintone'],
  rules: {
    'max-statements': ['warn', { max: 100 }, { ignoreTopLevelFunctions: true }],
    'object-curly-spacing': ['off', 'never'],
  },
};
