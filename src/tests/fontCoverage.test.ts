import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Every non-ASCII character used in content and screens must exist in the subsetted Japanese fonts.
 * If this fails, run `python scripts/subset-fonts.py <ttf-dir>` (see its docstring).
 */
function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (/\.(ts|tsx)$/.test(name) && !name.endsWith('.test.ts')) yield p;
  }
}

describe('font subset coverage', () => {
  it('covers every non-ASCII character in content, screens, components and docs/SPEC.md', () => {
    const root = join(__dirname, '..', '..');
    const covered = new Set<number>(JSON.parse(readFileSync(join(root, 'src/theme/fonts/coverage.json'), 'utf8')));
    const missing = new Map<string, Set<string>>();
    const dirs = ['src/content', 'src/screens', 'src/components', 'src/audio'].map((d) => join(root, d));
    for (const file of [...dirs.flatMap((d) => [...walk(d)]), join(root, 'docs/SPEC.md')]) {
      for (const ch of readFileSync(file, 'utf8')) {
        const cp = ch.codePointAt(0)!;
        if (cp > 0x7f && cp < 0x1f000 && cp !== 0xfe0f && !covered.has(cp)) {
          if (!missing.has(file)) missing.set(file, new Set());
          missing.get(file)!.add(ch);
        }
      }
    }
    const report = [...missing].map(([f, chars]) => `${f}: ${[...chars].join(' ')}`).join('\n');
    expect(report, `uncovered characters:\n${report}`).toBe('');
  });
});
