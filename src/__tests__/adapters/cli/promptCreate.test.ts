import { promptCreateFile } from '../../../adapters/cli/promptCreate';

type MockRl = {
  question: jest.Mock;
  close: jest.Mock;
};

const mockFactory = (answer: string) => {
  const rl: MockRl = {
    question: jest.fn((_prompt: string, cb: (ans: string) => void) => cb(answer)),
    close: jest.fn(),
  };
  return () => rl as unknown as ReturnType<typeof import('readline').createInterface>;
};

describe('promptCreateFile', () => {
  it('resolves true when user answers "y"', async () => {
    const result = await promptCreateFile('/some/file.txt', mockFactory('y'));
    expect(result).toBe(true);
  });

  it('resolves true when user answers "Y"', async () => {
    const result = await promptCreateFile('/some/file.txt', mockFactory('Y'));
    expect(result).toBe(true);
  });

  it('resolves false when user answers "n"', async () => {
    const result = await promptCreateFile('/some/file.txt', mockFactory('n'));
    expect(result).toBe(false);
  });

  it('resolves false when user presses enter (empty string)', async () => {
    const result = await promptCreateFile('/some/file.txt', mockFactory(''));
    expect(result).toBe(false);
  });

  it('resolves false when user answers "yes" (not exact "y")', async () => {
    const result = await promptCreateFile('/some/file.txt', mockFactory('yes'));
    expect(result).toBe(false);
  });

  it('resolves false when user answers with whitespace only', async () => {
    const result = await promptCreateFile('/some/file.txt', mockFactory('  '));
    expect(result).toBe(false);
  });

  it('closes the readline interface after answering', async () => {
    const rl: MockRl = {
      question: jest.fn((_prompt: string, cb: (ans: string) => void) => cb('y')),
      close: jest.fn(),
    };
    const factory = () => rl as unknown as ReturnType<typeof import('readline').createInterface>;
    await promptCreateFile('/some/file.txt', factory);
    expect(rl.close).toHaveBeenCalledTimes(1);
  });
});
