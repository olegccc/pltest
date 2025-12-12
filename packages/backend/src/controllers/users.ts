import { Request, Response } from 'express';
import { UsersResponse } from 'shared';
import { DbService } from '../services/db.js';
import { UserMetricsService } from '../services/userMetrics.js';
import { LocalAiService } from '../services/localAi.js';
import { PseudoAiService } from '../services/pseudoAi.js';
import { PromptService } from '../services/prompt.js';
import { handleError } from '../utils/errorHandler.js';

interface UserIdRow {
  user_id: string;
}

export const createUsersController = (
  dbService: DbService,
  userMetricsService: UserMetricsService,
  localAiService: LocalAiService,
  pseudoAiService: PseudoAiService,
  promptService: PromptService
) => {
  const getUsers = async (_req: Request, res: Response) => {
    try {
      const rows = dbService.query<UserIdRow>(
        'SELECT DISTINCT user_id FROM events ORDER BY user_id'
      );
      const userIds = rows.map(row => row.user_id);

      const response: UsersResponse = { userIds };
      res.json(response);
    } catch (error) {
      handleError(res, error, 'Failed to fetch user IDs');
    }
  };

  const getUserMetrics = async (req: Request, res: Response) => {
    try {
      const userId = req.params.user_id;
      const metrics = await userMetricsService.getUserMetrics(userId);

      if (!metrics) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(metrics);
    } catch (error) {
      handleError(res, error, 'Failed to fetch user metrics');
    }
  };

  const explainUserMetrics = async (req: Request, res: Response) => {
    try {
      const userId = req.params.user_id;
      const metrics = await userMetricsService.getUserMetrics(userId);

      if (!metrics) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      let explanation: string;

      if (localAiService.available()) {
        const prompt = promptService.generateUserMetricsExplanationPrompt(metrics);
        explanation = await localAiService.prompt(prompt);
      } else {
        explanation = pseudoAiService.generateExplanation(metrics);
      }

      res.json({ explanation: explanation.trim() });
    } catch (error) {
      handleError(res, error, 'Failed to generate explanation');
    }
  };

  return {
    getUsers,
    getUserMetrics,
    explainUserMetrics,
  };
};

export type UsersController = ReturnType<typeof createUsersController>;
