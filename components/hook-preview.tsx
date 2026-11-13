import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { HookPreviewFrame } from '@/components/hook-preview-frame';
import { demos } from '@/demos';

export function HookPreview({ name }: { name: string }) {
  const filePath = join(process.cwd(), 'demos', `${name}.tsx`);
  const DemoComponent = demos[name];

  if (!DemoComponent || !existsSync(filePath)) {
    return null;
  }

  const code = readFileSync(filePath, 'utf8');

  return (
    <Tabs items={['Preview', 'Code']}>
      <Tab value="Preview">
        <HookPreviewFrame>
          <DemoComponent />
        </HookPreviewFrame>
      </Tab>
      <Tab value="Code">
        <ServerCodeBlock
          lang="tsx"
          code={code}
          codeblock={{ title: `demos/${name}.tsx` }}
        />
      </Tab>
    </Tabs>
  );
}
