'use strict';

exports.port = process.env.PORT || 4001;
exports.mongodb = {
  uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://flowchainfoundation:7436080b95c0e69be8711f0f7df4f1a2@ds049170.mlab.com:49170/flowchainfoundation'
};
exports.companyName = '良田美池';
exports.projectName = '良田美池';
exports.systemEmail = 'jollen@jollen.org';
exports.cryptoKey = 'z9rdd330y6s';
exports.loginAttempts = {
  forIp: 50,
  forIpAndUser: 7,
  logExpiration: '20m'
};
exports.requireAccountVerification = true;
exports.smtp = {
  from: {
    name: process.env.SMTP_FROM_NAME || exports.projectName,
    address: process.env.SMTP_FROM_ADDRESS || 'contact@moko365.com'
  },
  credentials: {
    user: process.env.SMTP_USERNAME || 'camp@moko365.com',
    password: process.env.SMTP_PASSWORD || 'a7XUFY<W',
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    ssl: true
  }
};
exports.oauth = {
  twitter: {
    key: process.env.TWITTER_OAUTH_KEY || '',
    secret: process.env.TWITTER_OAUTH_SECRET || ''
  },
  facebook: {
    key: process.env.FACEBOOK_OAUTH_KEY || '477619905696719',
    secret: process.env.FACEBOOK_OAUTH_SECRET || 'ea6098c21de586ec66520e65ead6f6c3'
  },
  github: {
    key: process.env.GITHUB_OAUTH_KEY || '',
    secret: process.env.GITHUB_OAUTH_SECRET || ''
  },
  google: {
    key: process.env.GOOGLE_OAUTH_KEY || '',
    secret: process.env.GOOGLE_OAUTH_SECRET || ''
  }
};

// forbest.tw 
exports.cdnServer = '';
exports.cacheBreaker = '?20140402_3'
