module.exports = process.env.NODE_ENV && process.env.NODE_ENV === 'coverage' ? require('./lib-cov/index.js') : require('./lib/index.js');
