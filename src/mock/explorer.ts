import { Request, Response } from 'express';
import * as R from 'ramda';
import moment from 'moment';
import randomName from 'random-name';
import { uniqueId } from 'lodash';

export const getUID = () => String(uniqueId());

export const getDate = () => moment().format('YYYY-MM-DD[T]HH:mm:ss.SSSZZ');

export const extensions = ['xlsx', 'pdf', 'ipynb'];

export const genFileItems = (): any[] =>
  Array.from(extensions).map((ext, i) => {
    const id = getUID();
    return {
      fileName: `file_${id}.${ext}`,
      fileId: id,
      createDate: '2020-11-03 13:32:03',
      modifiedDate: '2020-11-03 13:32:03',
      type: 'file',
      size: 12412 * (i + 1),
    };
  });

const genDirItems = (depth = 0, cnt = 5): any[] =>
  Array.from(Array(cnt)).map(() => {
    const id = getUID();
    const childDir = depth > 0 ? genDirItems(depth - 1) : [];
    return {
      fileName: `dir_${id}`,
      fileId: id,
      createDate: '2020-11-03 13:32:03',
      modifiedDate: '2020-11-03 13:32:03',
      type: 'dir',
      child: [...childDir, ...genFileItems()],
    };
  });

const dirItems: any[] = [
  {
    fileName: '/',
    fileId: 'rootasdaswojd',
    createDate: '2020-11-03 13:32:03',
    modifiedDate: '2020-11-03 13:32:03',
    type: 'dir',
    child: [
      {
        fileName: '가입자 분석',
        fileId: 'checkunique',
        createDate: '2020-11-03 13:32:03',
        modifiedDate: '2020-11-03 13:32:03',
        type: 'dir',
        child: [...genDirItems(2), ...genFileItems()],
      },
      {
        fileName: '해지 원인 분석',
        fileId: getUID(),
        createDate: '2020-11-03 13:32:03',
        modifiedDate: '2020-11-03 13:32:03',
        type: 'dir',
        child: [...genDirItems(1), ...genFileItems()],
      },
      {
        fileName: '기타 분석',
        fileId: getUID(),
        createDate: '2020-11-03 13:32:03',
        modifiedDate: '2020-11-03 13:32:03',
        type: 'dir',
        child: [
          ...genDirItems(0, 30),
          {
            fileName: '테스트1',
            fileId: 'testdepth1',
            createDate: '2020-11-03 13:32:03',
            modifiedDate: '2020-11-03 13:32:03',
            type: 'dir',
            child: [
              {
                fileName: '테스트2',
                fileId: 'testdepth2',
                createDate: '2020-11-03 13:32:03',
                modifiedDate: '2020-11-03 13:32:03',
                type: 'dir',
                child: [
                  {
                    fileName: '테스트3',
                    fileId: 'testdepth3',
                    createDate: '2020-11-03 13:32:03',
                    modifiedDate: '2020-11-03 13:32:03',
                    type: 'dir',
                    child: [],
                  },
                ],
              },
            ],
          },
        ],
      },
      ...genFileItems(),
    ],
  },
];

export function genErrorObj(message, status = 500) {
  return {
    error: {
      message,
      status,
    },
  };
}

export function getOnlyDir(items) {
  if (!items) return [];
  const newItem = items.filter((item) => item.type === 'dir');
  return newItem.map((item) => {
    item.child = getOnlyDir(item.child);
    return item;
  });
}

export const getDirectories = (req: Request, res: Response) => {
  let items = R.clone(dirItems);
  items = getOnlyDir(items);
  res.status(200).json({
    result: items,
  });
};

export function getDir(items, fileId): any {
  if (!items || !items.length) return null;

  if (!fileId) return null;

  const findDir = (list) => {
    for (let i = 0; i < list.length; i++) {
      if (list[i].fileId === fileId) return list[i];
      const findItem = findDir(list[i].child || []);
      if (findItem) return findItem;
    }

    return null;
  };

  return findDir(items);
}

export function removeChild(items): any {
  if (!items) return items;

  return items.map((item) => ({
    ...item,
    child: null,
  }));
}

export const getFiles = (req: Request, res: Response) => {
  const { fileId } = req.params;

  const items = R.clone(dirItems);

  if (!fileId) return res.status(200).json({ result: removeChild(items) });

  const dirFiles = getDir(items, fileId);

  if (!dirFiles) return res.status(400).json(genErrorObj('invalid directory 1', 400));

  if (dirFiles.type !== 'dir') return res.status(400).json(genErrorObj('invalid directory 2', 400));

  return res.status(200).json({ result: removeChild(dirFiles.child) });
};

export const getPathList = (path) => {
  const pathStr = path.replace(/(\/)$/, '');
  return pathStr.split('/').map((item) => (item === '' ? '/' : item));
};

export const pathValidation = (pathInfo: any | undefined) => {
  if (!pathInfo) throw new Error('존재하지 않는 경로');
  if (pathInfo.type !== 'dir') throw new Error('잘못된 경로');
  if (!pathInfo.child) pathInfo.child = [];
  return pathInfo;
};

export const getPathInfo = (list) => {
  let childList: any[] | undefined = dirItems;
  let pathInfo: any = undefined;

  for (let i = 0; i < list.length; i++) {
    const pathName = list[i];

    if (!childList) throw new Error('지정 경로가 잘못되었습니다. 1');

    pathInfo = childList.find((item) => item.fileName === pathName);

    if (!pathInfo) throw new Error('지정 경로가 잘못되었습니다. 2');
    childList = pathInfo.child;
  }

  return pathValidation(pathInfo);
};

export const requiredCheck = (items, res) => {
  items.forEach((item) => {
    if (!item) return res.status(404).json(genErrorObj('필수값이 존재하지 않습니다.', 404));
  });
};

export const genFileInfo = (fileInfo: {
  fileName: string;
  type: string;
  size?: number;
  meta?: {
    type: string;
    linkImage: string;
  };
}): any => {
  const id = getUID();
  const currentTime = getDate();

  return {
    fileId: id,
    fileName: fileInfo.fileName,
    type: fileInfo.type,
    meta: fileInfo.meta,
    child: fileInfo.type === 'dir' ? [] : undefined,
    size: fileInfo.type !== 'dir' ? fileInfo.size || Math.round(Math.random() * 10000) : undefined,
    createDate: currentTime,
    modifiedDate: currentTime,
  };
};
const createFileItem = (path, fileItem: any) => {
  const pathList = getPathList(path);

  const [firstPath] = pathList;

  if (!firstPath || firstPath !== '/') {
    throw new Error('잘못된 요청');
  }

  const currentPath = getPathInfo(pathList);

  if (!currentPath.child) throw new Error('잘못된 요청');

  const exists = currentPath.child.find((item) => item.fileName === fileItem.fileName);

  if (exists) throw new Error('동일한 이름이 존재합니다.');

  currentPath.child.push(fileItem);
};

const createFile = (req: Request, res: Response) => {
  const { fileName, path, type, meta } = req.body;

  requiredCheck([fileName, path, type], res);

  if (!/(file|dir|notebook)/.test(type)) {
    return res.status(400).json(genErrorObj('잘못된 요청', 400));
  }

  try {
    const newFile = genFileInfo({ fileName, type, meta });

    createFileItem(path, newFile);

    return res.status(200).json({ result: newFile });
  } catch (e) {
    return res.status(500).json(genErrorObj(e.message));
  }
};

const getParentItem = (items: any[] | undefined, id) => {
  const chkFile = items;

  if (!chkFile) return null;

  for (let i = 0; i < chkFile.length; i++) {
    if (chkFile[i].fileId === id) return chkFile;
    if (chkFile[i].child) {
      const childExists = getParentItem(chkFile[i].child, id);
      if (childExists) return childExists;
    }
  }

  return null;
};

const updateFile = (req: Request, res: Response) => {
  const { fileId } = req.params;
  const { fileName, path } = req.body;

  requiredCheck([fileId, fileName, path], res);

  const pathList = getPathList(path);

  const [firstPath] = pathList;

  if (!firstPath || firstPath !== '/') {
    return res.status(404).json(genErrorObj('잘못된 요청', 404));
  }

  try {
    const result = getParentItem(dirItems, fileId);
    if (!result) return res.status(500).json(genErrorObj('존재하지 않는 데이터'));

    const itemIndex = result.findIndex((item) => item.fileId === fileId);
    const copyItem = R.clone(result[itemIndex]);

    const updateItem = {
      ...copyItem,
      fileName,
      modifiedDate: getDate(),
    };

    createFileItem(path, updateItem);

    result.splice(itemIndex, 1);

    return res.status(200).json({ result: updateItem });
  } catch (e) {
    return res.status(500).json(genErrorObj(e.message));
  }
};

const deleteFile = (req: Request, res: Response) => {
  const { fileId } = req.params;

  requiredCheck([fileId], res);

  try {
    const result = getParentItem(dirItems, fileId);
    if (!result) return res.status(500).json(genErrorObj('존재하지 않는 데이터'));

    const itemIndex = result.findIndex((item) => item.fileId === fileId);

    if (itemIndex === -1) return res.status(500).json(genErrorObj('존재하지 않는 데이터'));

    result.splice(itemIndex, 1);

    return res.status(200).json({ result: true });
  } catch (e) {
    return res.status(500).json(genErrorObj(e.message));
  }
};

const imageList: any[] = Array.from(Array(30)).map((_, i) => ({
  imageId: String(i),
  imageName: randomName(),
  creator: randomName.last(),
  createDate: '2020-11-03 13:32:03',
  modifiedDate: '2020-11-03 13:32:03',
  description: `blah blah image ${i} description`,
}));

export default {
  'GET /neb/v0.1/users/:userId/workspace/root': getDirectories,
  'GET /neb/v0.1/users/:userId/workspace/files': getFiles,
  'GET /neb/v0.1/users/:userId/workspace/files/:fileId/sub': getFiles,
  'POST /neb/v0.1/users/:userId/workspace/files': createFile,
  'PATCH /neb/v0.1/users/:userId/workspace/files/:fileId/info': updateFile,
  'DELETE /neb/v0.1/users/:userId/workspace/files/:fileId': deleteFile,
  'GET /neb/v0.1/users/:userId/dirCheck': { result: dirItems },
  'GET /neb/v0.1/users/:userId/images': { result: imageList },
  'GET /error/workspace/:params': (_, res: Response) => {
    res.status(500).json(genErrorObj('에러임'));
  },
  'POST /neb/v0.1/users/:userId/notebook': (req: Request, res: Response) => {
    const { fileName } = req.body;
    if (fileName && /(.ipynb)$/.test(fileName)) {
      return res.status(200).json({
        result: {
          url: 'http://192.168.70.11:38084/user/nexr/notebooks/Untitled.ipynb',
        },
      });
    }
    return res.status(200).json({
      result: {
        url: null,
      },
    });
  },
};
