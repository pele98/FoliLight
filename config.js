import Constants from 'expo-constants';

let localhost;
if (Constants.manifest.debuggerHost) {
  localhost = Constants.manifest.debuggerHost.split(':').shift();
}

// set environment variables
const ENV = {
  dev: {
    API_URI: `http://data.foli.fi/`
  },
  prod: {
    // update the API_URI value with your publicly deployed API address
    API_URI: 'http://data.foli.fi/'
  }
};

const getEnvVars = (env = Constants.manifest.releaseChannel) => {
  if (__DEV__) {
    return ENV.dev;
  } else if (env === 'prod') {
    return ENV.prod;
  }
};

export default getEnvVars;