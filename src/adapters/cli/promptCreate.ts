import readline from 'readline';

type ReadlineFactory = typeof readline.createInterface;

export const promptCreateFile = (
  filePath: string,
  createInterface: ReadlineFactory = readline.createInterface,
): Promise<boolean> =>
  new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(`\n  File not found: ${filePath}\n  Create it? [y/N] `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
