import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';

const GITHUB_REPO = 'owner/repo';

export function HookInstallation({ name }: { name: string }) {
  const filePath = join(process.cwd(), 'hooks', `${name}.ts`);
  const code = readFileSync(filePath, 'utf8');

  return (
    <Tabs items={['Command', 'Manual']}>
      <Tab value="Command">
        <ServerCodeBlock
          lang="bash"
          code={`npx shadcn@latest add ${GITHUB_REPO}/${name}`}
        />
      </Tab>
      <Tab value="Manual">
        <Steps>
          <Step>Copy and paste the following code into your project.</Step>
          <ServerCodeBlock
            lang="ts"
            code={code}
            codeblock={{ title: `hooks/${name}.ts` }}
          />
          <Step>Update the import paths to match your project setup.</Step>
        </Steps>
      </Tab>
    </Tabs>
  );
}
