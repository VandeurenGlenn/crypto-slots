module.exports = {
  staticFileGlobs: [
    '!www/service-worker.js',
    'www/assets/**',
    'www/*.js',
    'www/*.html'
  ],
  root: 'www',
  stripPrefix: 'www/'
};
