const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Serve the MSW service worker from /public on web
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      if (req.url === '/mockServiceWorker.js') {
        res.setHeader('Content-Type', 'application/javascript');
        require('fs').createReadStream(
          path.join(__dirname, 'public', 'mockServiceWorker.js'),
        ).pipe(res);
        return;
      }
      middleware(req, res, next);
    };
  },
};

module.exports = withNativeWind(config, {
  input: './global.css',
  browserslistEnv: 'web',
});
