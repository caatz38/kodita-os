// Tiny syntax highlighter for slides (Luau, HTML, CSS). Returns React nodes.

const LUA_KEYWORDS = new Set([
  'local', 'function', 'end', 'if', 'then', 'else', 'elseif', 'for', 'in', 'do', 'while',
  'repeat', 'until', 'return', 'and', 'or', 'not', 'break', 'continue',
]);
const LUA_LITERALS = new Set(['nil', 'true', 'false']);

export function detectLang(code) {
  const t = code.trim();
  if (t.startsWith('<')) return 'html';
  if (/^[\w.#:\-\s,>*[\]="]+\{[\s\S]*:[\s\S]*;?[\s\S]*\}/.test(t) && !/\blocal\b|\bfunction\b/.test(t)) return 'css';
  return 'lua';
}

function lua(code) {
  const re = /(--[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)(?=\s*\()|([A-Za-z_]\w*)|(\.\.|[=<>~]=?|[+\-*/%#^])/g;
  const out = [];
  let last = 0;
  let m;
  while ((m = re.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const [tok, comment, str, num, call, word, op] = m;
    let cls = null;
    if (comment) cls = 'hl-comment';
    else if (str) cls = 'hl-string';
    else if (num) cls = 'hl-number';
    else if (call) cls = LUA_KEYWORDS.has(call) ? 'hl-keyword' : 'hl-func';
    else if (word) cls = LUA_KEYWORDS.has(word) ? 'hl-keyword' : LUA_LITERALS.has(word) ? 'hl-literal' : null;
    else if (op) cls = 'hl-op';
    out.push(cls ? <span key={m.index} className={cls}>{tok}</span> : tok);
    last = m.index + tok.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

function css(code, keyBase = 0) {
  const re = /(\/\*[\s\S]*?\*\/)|([^{}\n][^{}]*?)(?=\s*\{)|([\w-]+)(?=\s*:)|(:\s*)([^;{}\n]+)(;?)/g;
  const out = [];
  let last = 0;
  let m;
  while ((m = re.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const [tok, comment, selector, prop, colon, value, semi] = m;
    const k = keyBase + m.index;
    if (comment) out.push(<span key={k} className="hl-comment">{comment}</span>);
    else if (selector) out.push(<span key={k} className="hl-selector">{selector}</span>);
    else if (prop) out.push(<span key={k} className="hl-prop">{prop}</span>);
    else if (value) {
      out.push(colon, <span key={k} className="hl-value">{value}</span>, semi);
    }
    last = m.index + tok.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

function html(code) {
  const out = [];
  // Split out <style> blocks so their contents get CSS colors.
  const parts = code.split(/(<style>[\s\S]*?<\/style>)/g);
  parts.forEach((part, pi) => {
    const style = part.match(/^<style>([\s\S]*?)<\/style>$/);
    if (style) {
      out.push(...tags('<style>', pi * 100000));
      out.push(...css(style[1], pi * 100000 + 50000));
      out.push(...tags('</style>', pi * 100000 + 90000));
    } else out.push(...tags(part, pi * 100000));
  });
  return out;
}

function tags(code, keyBase) {
  const re = /(<!--[\s\S]*?-->)|(<\/?)([\w-]+)([^>]*?)(\/?>)/g;
  const out = [];
  let last = 0;
  let m;
  while ((m = re.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const [tok, comment, open, name, attrs, close] = m;
    const k = keyBase + m.index;
    if (comment) out.push(<span key={k} className="hl-comment">{comment}</span>);
    else {
      out.push(<span key={`${k}a`} className="hl-punct">{open}</span>);
      out.push(<span key={`${k}b`} className="hl-tag">{name}</span>);
      const attrRe = /([\w-]+)(=)("[^"]*"|'[^']*')?/g;
      let al = 0;
      let am;
      while ((am = attrRe.exec(attrs))) {
        if (am.index > al) out.push(attrs.slice(al, am.index));
        out.push(<span key={`${k}c${am.index}`} className="hl-attr">{am[1]}</span>, am[2]);
        if (am[3]) out.push(<span key={`${k}d${am.index}`} className="hl-string">{am[3]}</span>);
        al = am.index + am[0].length;
      }
      if (al < attrs.length) out.push(attrs.slice(al));
      out.push(<span key={`${k}e`} className="hl-punct">{close}</span>);
    }
    last = m.index + tok.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export function highlight(code, lang = detectLang(code)) {
  if (lang === 'html') return html(code);
  if (lang === 'css') return css(code);
  return lua(code);
}
