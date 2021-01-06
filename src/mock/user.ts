import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { genErrorObj } from './explorer';
import * as R from 'ramda';

const JWT_KEY = 'test_key';
const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

async function getFakeCaptcha(req: Request, res: Response) {
  await waitTime(2000);
  return res.json('captcha-xxx');
}

const userList = [
  {
    id: 1,
    userId: 'liamyoon',
    password: '1111',
    name: 'liam.yoon',
    age: 33,
    group: 'rnd',
    authority: 'admin',
    avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
  },
  {
    id: 2,
    userId: 'yapyap30',
    password: '2222',
    name: 'kst',
    age: 30,
    group: 'de',
    authority: 'user',
    avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
  },
  {
    id: 3,
    userId: 'steelo',
    password: '3333',
    name: 'jo kang hyun',
    age: 26,
    group: 'sales',
    authority: 'user',
    avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
  },
];

const findUser = (userId, password) => {
  return R.find(R.allPass([R.propEq('userId', userId), R.propEq('password', password)]))(userList);
};

const genToken = ({ id, userId, name, group, authority, avatar }, isRefresh?: boolean) => {
  return jwt.sign(
    {
      data: {
        id,
        userId,
        name,
        group,
        authority,
        avatar,
      },
    },
    JWT_KEY,
    {
      expiresIn: isRefresh ? '4w' : '2h',
    },
  );
};
export default {
  'GET /api/getToken': (req, res) => {
    const token = jwt.sign(
      {
        data: {
          id: 1,
          userId: 'liamyoon',
          name: 'liam.yoon',
          age: 33,
          group: 'rnd',
          authority: 'admin',
        },
      },
      JWT_KEY,
      {
        expiresIn: '1d',
      },
    );
    res.status(200).json({ token });
  },
  'GET /api/currentUser': (req, res) => {
    const token = req.headers['x-neb-token'];
    try {
      if (!token) return res.status(500).json(genErrorObj('invalid user'));
      const decoded = jwt.verify(token, JWT_KEY);
      return res.status(200).json(decoded);
    } catch (e) {
      return res.status(500).json(genErrorObj(e.message));
    }
  },
  // GET POST 可省略
  'GET /api/users': (req: Request, res: Response) => {
    return res.status(200).json(userList);
  },
  'POST /api/login/account': async (req: Request, res: Response) => {
    const { password, userName, type } = req.body;
    await waitTime(2000);
    const userInfo = findUser(userName, password);
    if (userInfo) {
      res.send({
        status: 'ok',
        type,
        currentAuthority: userInfo.authority,
        accessToken: genToken(userInfo),
        refreshToken: genToken(userInfo, true),
      });
      return;
    }

    res.send({
      status: 'error',
      type,
      currentAuthority: 'guest',
    });
  },
  'POST /api/login/refreshToken': (req: Request, res: Response) => {
    const token = req.headers['x-neb-token'];
    const { refreshToken } = req.body;
    try {
      if (!token) return res.status(500).json(genErrorObj('invalid user'));
      const decoded = jwt.verify(refreshToken, JWT_KEY);
      return res.send({
        accessToken: genToken(decoded.data),
        refreshToken: genToken(decoded.data, true),
      });
    } catch (e) {
      return res.status(500).json(genErrorObj(e.message));
    }
  },
  'POST /api/register': (req: Request, res: Response) => {
    res.send({ status: 'ok', currentAuthority: 'user' });
  },
  'GET /api/500': (req: Request, res: Response) => {
    res.status(500).send({
      timestamp: 1513932555104,
      status: 500,
      error: 'error',
      message: 'error',
      path: '/base/category/list',
    });
  },
  'GET /api/404': (req: Request, res: Response) => {
    res.status(404).send({
      timestamp: 1513932643431,
      status: 404,
      error: 'Not Found',
      message: 'No message available',
      path: '/base/category/list/2121212',
    });
  },
  'GET /api/403': (req: Request, res: Response) => {
    res.status(403).send({
      timestamp: 1513932555104,
      status: 403,
      error: 'Unauthorized',
      message: 'Unauthorized',
      path: '/base/category/list',
    });
  },
  'GET /api/401': (req: Request, res: Response) => {
    res.status(401).send({
      timestamp: 1513932555104,
      status: 401,
      error: 'Unauthorized',
      message: 'Unauthorized',
      path: '/base/category/list',
    });
  },

  'GET  /api/login/captcha': getFakeCaptcha,
};
