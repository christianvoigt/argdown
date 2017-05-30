import {app} from '../index.js';

export const command = '*';
export const desc = 'load config file, parse argdown input and run argdown processors';
export const handler = function(argv){
  let config = app.loadConfig(argv.config);
  config.verbose = argv.verbose ||config.verbose;
  config.watch = argv.watch ||config.watch;
  app.load(config);
}
