import { Request, Response } from 'express';

const database = {
  users: [
    {
      id: 1,
      name: 'liam.yoon',
      authority: 'admin',
      department: 'rnd',
    },
    {
      id: 2,
      name: 'liam.user',
      authority: 'user',
      department: 'de',
    },
    {
      id: 3,
      name: 'liam.test',
      authority: 'test',
      department: 'test',
    },
  ],
}

const createUser = (req: Request, res: Response) => {
  const { name, authority, department } = req.body;
  // 현재 id max값 + 1;
  const id = Math.max(...database.users.map((user) => user.id)) + 1;
  const newUser = {
    id,
    name,
    authority,
    department,
  };
  // user 추가
  database.users.push(newUser);
  res.json(newUser);
}

const deleteUser = (req: Request, res: Response) => {
  const { id } = req.params;

  // params 로 넘어온 값이기에 number 형변환
  const userId = parseInt(id, 10);

  // isNaN의 경우 response 400
  if (isNaN(userId)) {
    return res.status(400).json({ error: '유효하지 않은 요청' });
  }

  const userExists = database.users.find((user) => user.id === parseInt(id, 10));

  // user 정보가 존재하지 않는 경우 404
  if (!userExists) {
    return res.status(404).json({ error: '존재하지 않는 사용자' });
  }

  // 필터링하여 저장
  database.users = database.users.filter((user) => user.id !== userId);

  return res.json({ success: true });
}

const updateUser = (req: Request, res: Response) => {
  const { name, authority, department } = req.body;
  // 현재 id max값 + 1;
  const id = Math.max(...database.users.map((user) => user.id)) + 1;
  const newUser = {
    id,
    name,
    authority,
    department,
  };
  // user 추가
  database.users.push(newUser);
  res.json(newUser);
}

export default {
  'GET /api/nexr/users': (req, res) => res.json(database.users),
  'POST /api/nexr/users': createUser, // create 등록
  'DELETE /api/nexr/users/:id': deleteUser,
  'PUT /api/nexr/users': updateUser,
}
