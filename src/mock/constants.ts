export const FILE_TYPE = {
  DIR: 'dir',
  FILE: 'file',
  NOTEBOOK: 'notebook',
};

export const FILE_TEXT = {
  [FILE_TYPE.DIR]: '폴더',
  [FILE_TYPE.FILE]: '파일',
  [FILE_TYPE.NOTEBOOK]: '노트북',
};

export const NEWFOLDER_DEFAULT_LABELS = {
  title: 'explorer.newFolder.title',
  defaultName: 'explorer.newFolder.defaultFolderName',
  field1: 'explorer.field.folderName',
  field1Placeholder: 'explorer.field.folderName.placeholder',
  field1Required: 'explorer.field.folderName.required',
  field1NameRule: 'explorer.field.folderName.nameRule',
  field2: 'explorer.field.setPath',
  field2Required: 'explorer.field.setPath.required',
  okText: 'explorer.confirm.okText',
  cancelText: 'explorer.confirm.cancelText',
};
