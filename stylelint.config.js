module.exports = {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-order'],
  ignoreFiles: ['src/style/themes.css'],
  rules: {
    'declaration-property-value-no-unknown': null,
    'import-notation': null,
    'media-feature-range-notation': 'prefix',
    'no-descending-specificity': null,
    'no-invalid-position-at-import-rule': null,
    'selector-class-pattern': null,
    'selector-id-pattern': null,
    'selector-not-notation': null,
    'value-keyword-case': null,
    'order/properties-alphabetical-order': true
  },
  overrides: [
    {
      files: ['**/*.styl'],
      customSyntax: 'postcss-styl'
    }
  ]
};
