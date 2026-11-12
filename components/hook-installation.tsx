import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';

const GITHUB_REPO = 'owner/repo';

export function HookInstallation({ name }: { name: string }) {
  const filePath = join(process.cwd(), 'hooks', `${name}.ts`);
  const code = readFileSync(filePath, 'utf8');

  return (
    <Tabs items={['CLI', 'Manual']}>
      <Tab value="CLI">
        <ServerCodeBlock
          lang="bash"
          code={`npx shadcn@latest add ${GITHUB_REPO}/${name}`}
        />
      </Tab>
      <Tab value="Manual">
        <ServerCodeBlock
          lang="ts"
          code={code}
          codeblock={{ title: `hooks/${name}.ts` }}
        />
      </Tab>
    </Tabs>
  );
}
