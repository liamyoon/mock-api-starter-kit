import TableData from 'mock-table-data';

const projects = new TableData(
  Array.from(Array(10)).map((_, index) => ({
    projectId: String(index),
    projectName: `2020 카드 사용 패턴 분석 프로젝트_${index}`,
    userName: 'nexr',
    volumeUsage: Math.floor(Math.random() * 10000000),
    readingDeskCount: index,
    analysisStatus: Math.random() > 0.5 ? 'ON' : 'OFF',
    memo: 'Donec facilisis tortor ut augue lacinia, at viverra est semper.',
  })),
  { primaryKey: 'projectId' },
);

export default {
  'GET /api/table': projects.dataSource,
  'POST /api/table': (req, res) => {
    const key = projects.dataSource.length;
    projects.insertRow({
      projectId: String(key),
      projectName: `2020 카드 사용 패턴 분석 프로젝트_${key}`,
      userName: 'nexr',
      volumeUsage: Math.floor(Math.random() * 10000000),
      readingDeskCount: key,
      analysisStatus: Math.random() > 0.5 ? 'ON' : 'OFF',
      memo: 'Donec facilisis tortor ut augue lacinia, at viverra est semper.',
    });
    res.status(200).json({ success: true });
  },
  'DELETE /api/table/:id': (req, res) => {
    const { id } = req.params;
    projects.deleteRow([{ projectId: id }]);
    res.status(200).json({ success: true });
  },

};
