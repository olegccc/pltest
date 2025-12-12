import { Response } from 'express';

export const handleError = (res: Response, error: unknown, fallbackMessage: string): void => {
  const errorMessage = error instanceof Error ? error.message : fallbackMessage;
  res.status(500).json({ error: errorMessage });
};
