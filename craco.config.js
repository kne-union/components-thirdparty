const fs = require('fs');
const path = require('path');
const { CracoRemoteComponentsPlugin } = require('@kne/modules-dev');
const aliasConfig = require('./webstorm.webpack.config');

process.env.CI = false;

const localFormCreatorRoot = path.resolve(__dirname, '../form-creator');
const localFormCreatorSrc = path.join(localFormCreatorRoot, 'src');
const localFormCreatorCss = path.join(localFormCreatorRoot, 'dist/index.css');
const useLocalFormCreator =
  process.env.NODE_ENV !== 'production' && fs.existsSync(path.join(localFormCreatorSrc, 'index.js'));

const allowOutsideSrc = (webpackConfig, dir) => {
  const plugin = webpackConfig.resolve.plugins?.find(item => item.constructor?.name === 'ModuleScopePlugin');
  if (!plugin) {
    return;
  }
  plugin.allowedPaths = plugin.allowedPaths || [];
  if (!plugin.allowedPaths.includes(dir)) {
    plugin.allowedPaths.push(dir);
  }
};

const addBabelInclude = (webpackConfig, dir) => {
  const oneOf = webpackConfig.module.rules.find(rule => Array.isArray(rule.oneOf))?.oneOf;
  if (!oneOf) {
    return;
  }
  oneOf.forEach(rule => {
    const loaders = []
      .concat(rule.loader || [])
      .concat((rule.use || []).map(item => (typeof item === 'string' ? item : item?.loader)))
      .filter(Boolean);
    if (!loaders.some(loader => String(loader).includes('babel-loader'))) {
      return;
    }
    if (!rule.include) {
      return;
    }
    const include = Array.isArray(rule.include) ? rule.include : [rule.include];
    if (!include.includes(dir)) {
      rule.include = include.concat(dir);
    }
  });
};

module.exports = {
  webpack: {
    alias: {
      ...aliasConfig.resolve.alias,
      ...(useLocalFormCreator
        ? {
            '@kne/form-creator/dist/index.css': localFormCreatorCss,
            '@kne/form-creator': localFormCreatorSrc
          }
        : {})
    },
    configure: webpackConfig => {
      const definePlugin = webpackConfig.plugins.find(plugin => plugin.constructor.name === 'DefinePlugin');
      Object.assign(definePlugin.definitions['process.env'], {
        DEFAULT_VERSION: `"${process.env.npm_package_version}"`
      });
      if (useLocalFormCreator) {
        allowOutsideSrc(webpackConfig, localFormCreatorSrc);
        allowOutsideSrc(webpackConfig, localFormCreatorRoot);
        addBabelInclude(webpackConfig, localFormCreatorSrc);
      }
      return webpackConfig;
    }
  },
  plugins: [
    {
      plugin: CracoRemoteComponentsPlugin
    }
  ]
};
