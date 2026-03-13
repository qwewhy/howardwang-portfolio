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
      while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) j++
      const word = line.slice(i, j)

      const keywords = lang === 'cpp' ? CPP_KEYWORDS : TS_KEYWORDS
      const typeKws = lang === 'cpp' ? new Set<string>() : TS_TYPE_KEYWORDS

      if (keywords.has(word)) {
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

export function CodeWindow({ code, language, fileLabel }: CodeWindowProps) {
  const lines = useMemo(() => code.trim().split('\n'), [code])
  const lang = language === 'tsx' ? 'ts' : language

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
          <span className={styles.language}>{language}</span>
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
