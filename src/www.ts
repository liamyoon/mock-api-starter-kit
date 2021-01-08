import express from 'express';
import { createServer } from 'http';
import morgan from 'morgan';
import path from 'path';
import cors from 'cors';
import getMockMiddleware from './utils/createMockMiddleware';

const app: express.Application = express();
app.use(cors());
app.use(morgan('dev'));
app.use(getMockMiddleware(path.join(__dirname, '/')))

const port: number = Number(process.env.PORT) || 3000;

const server = createServer(app);

server.listen(port, () => {
  console.log(`http://localhost:${port} mockup server on`);
});
