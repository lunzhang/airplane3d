module.exports = {
  "env": {
    "browser": true,
    "node": true
  },
  "extends": "airbnb-base",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "globals": {
    'THREE': true
  },
  "rules": {
    "no-mixed-operators": 0,
    "no-param-reassign": 0,
    "no-plusplus": [2, {"allowForLoopAfterthoughts": true}],
    "import/no-extraneous-dependencies": 0,
    "max-len": [2, {"code": 160}],
    "import/no-unresolved": 0,
    "import/extensions": 0,
    "default-case": 0,
    "no-restricted-properties": 0,
    "class-methods-use-this": 0
  }
};
