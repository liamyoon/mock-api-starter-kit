import { Request, Response } from 'express';
import moment from 'moment';
import randomName from 'random-name';

// generate list data
const genStorageListData = Array.from({ length: 20 }, (v, i) => {
  const dateNow = Date.now();
  const dateRandomStr = dateNow.toString(36);
  const mathRandom = Math.random();
  const mathRandomStr = mathRandom.toString(36).substr(2, 5);
  const firstName = randomName.first();
  const middleName = randomName.middle();
  return {
    storageId: `st_${dateRandomStr + mathRandomStr}`,
    storageName: `Storage_${firstName}`,
    use: Math.floor(mathRandom * 2) % 2 === 1,
    description: `MySQL_${firstName + middleName}_created_${moment().format('YYYY-MM-DD')}`,
    storageType: 'JDBC',
    connection: {
      name: `Database_${firstName + middleName}`,
      url: `jdbc:mysql://192.168.150.${Math.floor(Math.random() * 255) + 1}:3306`,
      loginId: `root`,
      password: `pwd ${mathRandomStr}`,
      driver: `com.mysql.cj.jdbc.Driver`,
    },
  };
});

const genStorageData = (data: any) => ({
  ...data,
  storageId: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
});

const getStorageList = (req: Request, res: Response) => {
  try {
    return res.status(200).json({ result: genStorageListData });
  } catch (e) {
    return res.status(500).json(e.message);
  }
};

const createStorage = (req: Request, res: Response) => {
  const genData = genStorageData({ ...req.body });
  try {
    genStorageListData.push(genData);
    return res.status(200).json(genData);
  } catch (e) {
    return res.status(500).json(e.message);
  }
};

const updateStorage = (req: Request, res: Response) => {
  const updateRequestStorage = { ...req.body };
  // const { storageId } = updateRequestStorage;
  const { storageId } = req.params;
  try {
    const idx = genStorageListData.findIndex((v) => v.storageId === storageId);
    genStorageListData.splice(idx, 1, updateRequestStorage);
    return res.status(200).json(updateRequestStorage);
  } catch (e) {
    return res.status(500).json(e.message);
  }
};

const deleteStorage = (req: Request, res: Response) => {
  // const { storageId } = req.body;
  const { storageId } = req.params;
  try {
    const idx = genStorageListData.findIndex((v) => v.storageId === storageId);
    genStorageListData.splice(idx, 1);
    return res.status(200).json(storageId);
  } catch (e) {
    return res.status(500).json(e.message);
  }
};

const getStorageStatus = (req: Request, res: Response) => {
  const requestStorage = { ...req.body };
  try {
    const { url, loginId, password, driver } = requestStorage;
    // test storage status with request parameter
    return setTimeout(() => {
      return res.status(200).json({ responseMessage: `${url + loginId + password + driver}` });
    }, 1000);
  } catch (e) {
    console.log(e);
    return res.status(500).json(e.message);
  }
};

export default {
  'GET  /neb/v0.1/users/:userId/storages': getStorageList,
  'POST /neb/v0.1/users/:userId/storages': createStorage,
  'PATCH /neb/v0.1/users/:userId/storages/:storageId': updateStorage,
  'DELETE /neb/v0.1/users/:userId/storages/:storageId': deleteStorage,
  'GET /neb/v0.1/storages': getStorageStatus,
};
