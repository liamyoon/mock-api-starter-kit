import { Request, Response } from 'express';
import { genFileInfo, genFileItems } from './explorer';

let fileList = genFileItems();

const uploadFile = (req: Request, res: Response) => {
  let fileItems = (<any[]>req.files).map((file) =>
    genFileInfo({
      fileName: file.originalname,
      type: 'file',
      size: file.size,
    }),
  );

  const fileKeys = fileList.reduce((a, b) => {
    a[b.fileName] = true;
    return a;
  }, {});

  // 파일명 중복 시 file rename
  fileItems = fileItems.map((file) => {
    const fileArr = file.fileName.split('.');
    const ext = fileArr.pop();
    const originFileName = fileArr.join('.');
    let fileName = file.fileName;
    let loop = 1;
    while (fileKeys[fileName]) {
      fileName = `${originFileName} (${loop}).${ext}`;
      loop++;
    }
    return {
      ...file,
      fileName,
    };
  });

  fileList = fileList.concat(fileItems);

  return res.status(200).json({ status: 'done' });
};

export default {
  'POST /api/upload': uploadFile,
  'GET /api/upload/list': (_, res: Response) => {
    res.status(200).json(fileList);
  },
};
