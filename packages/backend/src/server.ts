import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { createDb } from './services/db.js';
import { createLocalAi } from './services/localAi.js';
import { createPseudoAiService } from './services/pseudoAi.js';
import { createUserMetricsService } from './services/userMetrics.js';
import { createPromptService } from './services/prompt.js';
import { createUsersController } from './controllers/users.js';
import { createUsersRouter } from './routes/users.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();

  const frontendRoot = path.resolve(__dirname, '../../frontend');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
    root: frontendRoot,
  });

  app.use(vite.middlewares);

  app.use('/api', express.json());

  const dbService = createDb();
  const localAiService = await createLocalAi();
  const pseudoAiService = createPseudoAiService();
  const userMetricsService = createUserMetricsService(dbService);
  const promptService = createPromptService();

  if (!localAiService.available()) {
    console.warn('Local AI model not available, using rule-based explanations');
  }

  const usersController = createUsersController(
    dbService,
    userMetricsService,
    localAiService,
    pseudoAiService,
    promptService
  );
  const usersRouter = createUsersRouter(usersController);

  app.use('/api', usersRouter);

  const indexPath = path.join(frontendRoot, 'index.html');
  const template = await fs.readFile(indexPath, 'utf-8');

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const html = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  const port = parseInt(process.env.PORT || '3000', 10);
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

createServer().catch(console.error);
