import type { HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLSpanElement> & {
  /** 'kana' = learnable text in Klee One; 'ui' = interface Japanese in M PLUS Rounded. */
  variant?: 'kana' | 'ui';
  as?: 'span' | 'p' | 'div' | 'h1' | 'h2';
};

/** Every piece of Japanese text goes through here so it always carries lang="ja" (spec §15). */
export function JpText({ variant = 'kana', as: Tag = 'span', className = '', ...rest }: Props) {
  return <Tag lang="ja" className={`${variant === 'kana' ? 'font-kana' : 'font-jp'} ${className}`} {...rest} />;
}
