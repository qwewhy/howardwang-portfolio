import '@fontsource/jetbrains-mono/400.css'
import { useMemo } from 'react'
import styles from './CodeWindow.module.css'

interface CodeWindowProps {
  code: string
  language: string
  fileLabel: string
}

type TokenKind = 'keyword' | 'type' | 'string' | 'comment' | 'number' | 'punctuation' | 'plain'

interface Token {
  kind: TokenKind
  text: string
}

const TS_KEYWORDS = new Set([
  'async', 'await', 'const', 'let', 'var', 'function', 'return', 'export',
  'import', 'from', 'if', 'else', 'throw', 'new', 'class', 'extends',
  'implements', 'private', 'readonly', 'public', 'protected', 'static',
])

const TS_TYPE_KEYWORDS = new Set([
  'type', 'interface', 'string', 'number', 'boolean', 'void', 'null',
  'undefined', 'true', 'false', 'any', 'never', 'unknown',
])

const CPP_KEYWORDS = new Set([
  'class', 'public', 'private', 'protected', 'void', 'int', 'signals',
  'connect', 'const', 'return', 'virtual', 'override',
])

const JAVA_KEYWORDS = new Set([
  'public', 'private', 'protected', 'class', 'interface', 'return',
  'new', 'final', 'void', 'import', 'package', 'extends', 'implements',
  'static', 'abstract', 'this',
])

function tokenizeLine(line: string, lang: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < line.length) {
    // Comments
    if (line.startsWith('//', i) || line.startsWith('/*', i) || line.startsWith(' *', i)) {
      tokens.push({ kind: 'comment', text: line.slice(i) })
      return tokens
    }

    // Strings
    if (line[i] === "'" || line[i] === '"' || line[i] === '`') {
      const quote = line[i]
      let j = i + 1
      while (j < line.length && line[j] !== quote) {
        if (line[j] === '\\') j++
        j++
      }
      tokens.push({ kind: 'string', text: line.slice(i, j + 1) })
      i = j + 1
      continue
    }

    // Numbers
    if (/\d/.test(line[i]) && (i === 0 || /[\s(,[\-+]/.test(line[i - 1]))) {
      let j = i
      while (j < line.length && /[\d.]/.test(line[j])) j++
      tokens.push({ kind: 'number', text: line.slice(i, j) })
      i = j
      continue
    }

    // Punctuation
    if (/[{}()[\];:,.<>=&|!?+\-*/]/.test(line[i])) {
      // Check for arrow =>
      if (line[i] === '=' && line[i + 1] === '>') {
        tokens.push({ kind: 'punctuation', text: '=>' })
        i += 2
        continue
      }
      tokens.push({ kind: 'punctuation', text: line[i] })
      i++
      continue
    }

    // Words
    if (/[a-zA-Z_$@#]/.test(line[i])) {
      let j = i
      if (line[j] === '@' || line[j] === '#') j++
      while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) j++
      const word = line.slice(i, j)

      const keywords = lang === 'java' ? JAVA_KEYWORDS : lang === 'cpp' ? CPP_KEYWORDS : TS_KEYWORDS
      const typeKws = lang === 'ts' ? TS_TYPE_KEYWORDS : new Set<string>()

      if (word.startsWith('@')) {
        tokens.push({ kind: 'keyword', text: word })
      } else if (keywords.has(word)) {
        tokens.push({ kind: 'keyword', text: word })
      } else if (typeKws.has(word)) {
        tokens.push({ kind: 'type', text: word })
      } else if (word[0] === word[0].toUpperCase() && /[a-z]/.test(word.slice(1))) {
        tokens.push({ kind: 'type', text: word })
      } else if (lang === 'cpp' && word === 'Q_OBJECT') {
        tokens.push({ kind: 'keyword', text: word })
      } else {
        tokens.push({ kind: 'plain', text: word })
      }
      i = j
      continue
    }

    // Whitespace or anything else
    let j = i
    while (j < line.length && !/[a-zA-Z0-9_$'"`{}()[\];:,.<>=&|!?+\-*/@#]/.test(line[j])) j++
    tokens.push({ kind: 'plain', text: line.slice(i, j || i + 1) })
    i = j || i + 1
  }

  return tokens
}

const KIND_CLASS: Record<TokenKind, string | undefined> = {
  keyword: styles.tokKeyword,
  type: styles.tokType,
  string: styles.tokString,
  comment: styles.tokComment,
  number: styles.tokNumber,
  punctuation: styles.tokPunctuation,
  plain: undefined,
}

function LanguageIcon({ language }: { language: string }) {
  const size = 14
  switch (language) {
    case 'ts':
    case 'tsx':
      return (
        <svg width={size} height={size} viewBox="0 0 128 128" aria-hidden="true">
          <rect width="128" height="128" rx="8" fill="#3178c6" />
          <path d="M82 95.4V109c2.6 1.3 5.8 2.4 9.3 3 3.5.7 7.2 1 11 1 3.7 0 7.2-.4 10.5-1.2 3.3-.8 6.2-2.1 8.6-3.9 2.4-1.8 4.3-4.1 5.7-6.8 1.4-2.8 2.1-6.1 2.1-10.1 0-2.9-.4-5.4-1.2-7.5-.8-2.2-2-4.1-3.5-5.8-1.5-1.7-3.3-3.2-5.4-4.5-2.1-1.3-4.4-2.5-6.9-3.6-1.8-.8-3.5-1.5-5-2.2-1.5-.7-2.8-1.4-3.9-2.1-1.1-.7-2-1.5-2.6-2.4-.6-.8-.9-1.8-.9-2.9 0-1 .3-1.9.8-2.6.5-.8 1.3-1.4 2.2-2 .9-.5 2.1-.9 3.4-1.2 1.3-.3 2.7-.4 4.2-.4 1.1 0 2.2.1 3.5.3 1.2.2 2.4.5 3.6.9 1.2.4 2.3.9 3.4 1.5 1.1.6 2 1.3 2.9 2.1V47.8c-2.3-.9-4.8-1.5-7.7-2-2.8-.4-6-.7-9.4-.7-3.7 0-7.1.4-10.3 1.3-3.2.9-6 2.2-8.3 3.9-2.3 1.8-4.1 4-5.4 6.7-1.3 2.7-2 5.8-2 9.3 0 4.8 1.4 8.9 4.2 12.2 2.8 3.4 7 6.2 12.5 8.5 2 .8 3.8 1.6 5.5 2.4 1.7.8 3.1 1.6 4.3 2.4 1.2.8 2.2 1.7 2.9 2.7.7.9 1 2 1 3.2 0 1-.3 1.9-.8 2.7-.5.8-1.2 1.4-2.2 1.9-.9.5-2 .9-3.3 1.2-1.3.3-2.7.4-4.2.4-3 0-6-.5-8.9-1.6-3-1.1-5.7-2.7-8.2-5zM72.6 58.4h-17V109H43.2V58.4H26.5V47h46.1v11.4z" fill="#fff" />
        </svg>
      )
    case 'java':
      return (
        <svg width={size} height={size} viewBox="0 0 128 128" aria-hidden="true">
          <path d="M47.6 98.6s-3.3 1.9 2.3 2.6c6.8.8 10.3.7 17.8-.8 0 0 2 1.2 4.7 2.3-16.8 7.2-38-0.4-24.8-4.1zm-2-9.3s-3.7 2.7 1.9 3.3c7.3.7 13 .8 22.9-1.1 0 0 1.4 1.4 3.5 2.1-20.2 5.9-42.7.5-28.3-4.3z" fill="#5382a1" />
          <path d="M69.1 61.7c4.1 4.7-1.1 9-1.1 9s10.4-5.4 5.6-12.1c-4.4-6.3-7.8-9.4 10.6-20.2 0 0-29 7.2-15.1 23.3z" fill="#e76f00" />
          <path d="M102.4 108.3s2.4 2-2.7 3.6c-9.6 2.9-40.2 3.8-48.7.1-3-1.3 2.7-3.1 4.5-3.5 1.9-.4 3-.3 3-.3-3.4-2.4-22.2 4.7-9.5 6.8 34.6 5.6 63.1-2.5 53.4-6.7zm-55.8-40s-15.7 3.7-5.6 5.1c4.3.6 12.8.4 20.8-.2 6.5-.5 13-1.6 13-1.6s-2.3 1-3.9 2.1c-16 4.2-46.8 2.2-37.9-2 7.5-3.6 13.6-3.4 13.6-3.4zm28.3 15.8c16.2-8.4 8.7-16.5 3.5-15.4-1.3.3-1.9.5-1.9.5s.5-.8 1.4-1.1c10.7-3.8 19 11.1-3.3 17-.1 0 .2-.2.3-.5z" fill="#5382a1" />
          <path d="M80.7 19.7s9 9-8.5 22.8c-14 11.1-3.2 17.4 0 24.6-8.2-7.4-14.2-13.9-10.2-20 5.9-8.9 22.3-13.2 18.7-27.4z" fill="#e76f00" />
          <path d="M49 118.3c15.6 1 39.5-.6 40.1-8 0 0-1.1 2.8-12.9 5-13.4 2.5-29.9 2.2-39.7.6 0 0 2 1.6 12.5 2.4z" fill="#5382a1" />
        </svg>
      )
    case 'cpp':
      return (
        <svg width={size} height={size} viewBox="0 0 128 128" aria-hidden="true">
          <path d="M117.5 33.5l.3-.2c-.6-1.1-1.5-2.1-2.4-2.6L67.1 2.9c-.8-.5-1.9-.7-3.1-.7-1.2 0-2.3.3-3.1.7l-48 27.9c-1.7 1-2.9 3.5-2.9 5.4v55.7c0 1 .3 1.9.9 2.8l.1.1c.1.1.1.2.2.3l.3.3c.2.2.4.4.7.6L60 123.1c.8.5 1.9.7 3.1.7 1.2 0 2.3-.3 3.1-.7l48-27.9c1.7-1 2.9-3.5 2.9-5.4V34.6c0-.4-.1-.8-.2-1.1h-.4z" fill="#659ad2" />
          <path d="M64 36.5c-15.2 0-27.5 12.3-27.5 27.5s12.3 27.5 27.5 27.5c10.5 0 19.7-5.9 24.3-14.6l-12.2-7c-2.6 4.8-7.7 8.1-13.6 8.1-8.5 0-15.4-6.9-15.4-15.4 0-8.5 6.9-15.4 15.4-15.4 5.5 0 10.3 2.9 13 7.2l12.5-6.5C83.3 41.1 74.2 36.5 64 36.5z" fill="#fff" />
          <g fill="#fff">
            <path d="M95 57.5h-4v-4h-4v4h-4v4h4v4h4v-4h4z" />
            <path d="M112 57.5h-4v-4h-4v4h-4v4h4v4h4v-4h4z" />
          </g>
        </svg>
      )
    default:
      return null
  }
}

export function CodeWindow({ code, language, fileLabel }: CodeWindowProps) {
  const lines = useMemo(() => code.trim().split('\n'), [code])
  const lang = language === 'tsx' || language === 'ts' ? 'ts' : language

  return (
    <div className={styles.window}>
      <div className={styles.header}>
        <div className={styles.trafficLights} aria-hidden="true">
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
        <div className={styles.meta}>
          <span className={styles.fileLabel}>{fileLabel}</span>
          <span className={styles.language}>
            <LanguageIcon language={language} />
            {language}
          </span>
        </div>
      </div>
      <ol className={styles.lines} aria-label={fileLabel}>
        {lines.map((line, index) => (
          <li key={`${fileLabel}:${index + 1}`} className={styles.line}>
            <span className={styles.lineNumber}>{index + 1}</span>
            <code className={styles.code}>
              {line
                ? tokenizeLine(line, lang).map((token, ti) => {
                    const cls = KIND_CLASS[token.kind]
                    return cls
                      ? <span key={ti} className={cls}>{token.text}</span>
                      : token.text
                  })
                : ' '
              }
            </code>
          </li>
        ))}
      </ol>
    </div>
  )
}
