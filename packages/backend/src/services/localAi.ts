import { getLlama, LlamaChatSession } from 'node-llama-cpp';

export const createLocalAi = async () => {
  const localModelPath: string | undefined = process.env.LOCAL_MODEL;

  if (!localModelPath) {
    return {
      prompt: async (_message: string) => {
        throw new Error('Local AI model is not configured');
      },
      available: () => false,
    };
  }

  try {
    const llama = await getLlama();
    const model = await llama.loadModel({
      modelPath: localModelPath,
    });

    const prompt = async (message: string) => {
      const context = await model.createContext();
      const session = new LlamaChatSession({
        contextSequence: context.getSequence(),
      });

      return await session.prompt(message);
    };

    return {
      prompt,
      available: () => true,
    };
  } catch (error) {
    console.warn('Failed to load local AI model:', error instanceof Error ? error.message : error);
    return {
      prompt: async (_message: string) => {
        throw new Error('Local AI model failed to load');
      },
      available: () => false,
    };
  }
};

export type LocalAiService = Awaited<ReturnType<typeof createLocalAi>>;
