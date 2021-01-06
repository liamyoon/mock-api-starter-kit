import { RequestHandler } from 'express';
import { existsSync } from 'fs';
import { join } from 'path';
import bodyParser from 'body-parser';
import glob from 'glob';
import assert from 'assert';
import chokidar from 'chokidar';
import { Key, pathToRegexp } from 'path-to-regexp';
import multer from 'multer';
import register from '@babel/register';

const debug = console.log;

const VALID_METHODS = ['get', 'post', 'put', 'patch', 'delete'];
const BODY_PARSED_METHODS = ['post', 'put', 'patch'];

export type RequestConfig = Record<string, RequestHandler | Record<string, any>>;

type RequestMethod = 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

function getMockMiddleware(path) {
  const absMockPath = join(path, 'mock');
  const absConfigPath = join(path, '.umirc.mock.js');
  register({
    presets: ['umi'],
    plugins: [
      require.resolve('babel-plugin-add-module-exports'),
      require.resolve('@babel/plugin-transform-modules-commonjs'),
    ],
    babelrc: false,
    only: [absMockPath]
  });

  let mockData = getConfig();
  watch();

  function watch() {
    if (process.env.WATCH_FILES === 'none') return;
    const watcher = chokidar.watch([absConfigPath, absMockPath], {
      ignoreInitial: true
    });
    watcher.on('all', (event, file) => {
      debug(`[${event}] ${file}, reload mock data`);
      mockData = getConfig();
    });
  }

  function getConfig() {
    cleanRequireCache();
    let ret = {};
    if (existsSync(absConfigPath)) {
      debug(`load mock data from ${absConfigPath}`);
      ret = require(absConfigPath); // eslint-disable-line
    } else {
      const mockFiles = glob.sync('**/*.ts', {
        cwd: absMockPath
      });
      debug(
        `load mock data from ${absMockPath}, including files ${JSON.stringify(
          mockFiles
        )}`
      );
      ret = mockFiles.reduce((memo, mockFile) => {
        const items = require(join(absMockPath, mockFile));
        memo = {
          ...memo,
          ...(items.default ? items.default : items),
        };
        return memo;
      }, {});
    }

    return normalizeConfig(ret);
  }

  function parseKey(key): { method: RequestMethod, path:  string } {
    let method = 'get' as RequestMethod;
    let path = key;
    if (key.indexOf(' ') > -1) {
      const splited = key.split(' ');
      method = splited[0].toLowerCase() as RequestMethod;
      path = splited[1]; // eslint-disable-line
    }
    assert(
      VALID_METHODS.includes(method),
      `Invalid method ${method} for path ${path}, please check your mock files.`
    );
    return {
      method,
      path
    };
  }

  function createHandler(method, path, handler) {
    return function(req, res, next) {
      if (BODY_PARSED_METHODS.includes(method)) {
        bodyParser.json({ limit: '5mb', strict: false })(req, res, () => {
          bodyParser.urlencoded({ limit: '5mb', extended: true })(
            req,
            res,
            () => {
              sendData();
            }
          );
        });
      } else {
        sendData();
      }

      function sendData() {
        if (typeof handler === 'function') {
          multer().any()(req, res, () => {
            handler(req, res, next);
          });
        } else {
          res.json(handler);
        }
      }
    };
  }

  function normalizeConfig(config: RequestConfig) {
    return Object.keys(config).reduce((memo, key) => {
      const handler = config[key];
      const type = typeof handler;
      assert(
        type === 'function' || type === 'object',
        `mock value of ${key} should be function or object, but got ${type}`
      );
      const { method, path } = parseKey(key);
      const keys = [];
      const re = pathToRegexp(path, keys);
      memo.push({
        method,
        path,
        re,
        keys,
        handler: createHandler(method, path, handler)
      });
      return memo;
    }, [] as Array<{ method: RequestMethod; path: string; re:RegExp; keys: Array<Key>; handler: RequestHandler }>);
  }

  function cleanRequireCache() {
    Object.keys(require.cache).forEach(file => {
      if (file === absConfigPath || file.indexOf(absMockPath) > -1) {
        delete require.cache[file];
      }
    });
  }

  function matchMock(req) {
    const { path: exceptPath } = req;
    const exceptMethod = req.method.toLowerCase();

    for (const mock of mockData) {
      const { method, re, keys } = mock;
      if (method === exceptMethod) {
        const match = re.exec(req.path);
        if (match) {
          const params = {};

          for (let i = 1; i < match.length; i = i + 1) {
            const key = keys[i - 1];
            const prop = key.name;
            const val = decodeParam(match[i]);

            // @ts-ignore
            if (val !== undefined || !hasOwnProperty.call(params, prop)) {
              params[prop] = val;
            }
          }
          req.params = params;
          return mock;
        }
      }
    }

    function decodeParam(val) {
      if (typeof val !== 'string' || val.length === 0) {
        return val;
      }

      try {
        return decodeURIComponent(val);
      } catch (err) {
        if (err instanceof URIError) {
          err.message = `Failed to decode param ' ${val} '`;
          (err as any).status = 400;
          (err as any).statusCode = 400;
        }

        throw err;
      }
    }

    return mockData.filter(({ method, re }) => {
      return method === exceptMethod && re.test(exceptPath);
    })[0];
  }

  return (req, res, next) => {
    const match = matchMock(req);

    if (match) {
      debug(`mock matched: [${match.method}] ${match.path}`);
      return match.handler(req, res, next);
    } else {
      return next();
    }
  };
}

export default getMockMiddleware;
