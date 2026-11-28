import { Fragment } from 'react';

/**
 * Small, safe markdown renderer for blog posts (no raw HTML). Supports
 * headings, paragraphs, ordered/unordered lists, blockquotes, links, bold,
 * italics and inline code — the subset the content guide allows.
 */
const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

const isExternal = (href) => /^https?:\/\//.test(href) && !href.startsWith('https://nukt.agency');

function renderInline(text) {
  return text.split(INLINE).filter(Boolean).map((part, index) => {
    const link = LINK.exec(part);
    if (link) {
      const [, label, href] = link;
      const external = isExternal(href);
      return (
        <a key={index} href={href} {...(external && { target: '_blank', rel: 'noopener' })}>
          {renderInline(label)}
        </a>
      );
    }
    if (part.startsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>;
    if (/^[*_].+[*_]$/.test(part)) return <em key={index}>{part.slice(1, -1)}</em>;
    return <Fragment key={index}>{part}</Fragment>;
  });
}

const BLOCK_RULES = [
  { type: 'heading', test: /^(#{1,4})\s+(.*)$/ },
  { type: 'ul', test: /^[-*]\s+(.*)$/ },
  { type: 'ol', test: /^\d+[.)]\s+(.*)$/ },
  { type: 'quote', test: /^>\s?(.*)$/ },
];

/** Groups lines into blocks: consecutive list/quote lines merge, blank lines split. */
function parseBlocks(source) {
  const blocks = [];

  for (const rawLine of source.replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trim();
    const previous = blocks[blocks.length - 1];

    if (!line) {
      if (previous) previous.closed = true;
      continue;
    }

    const rule = BLOCK_RULES.find(({ test }) => test.test(line));
    const match = rule && rule.test.exec(line);

    if (rule?.type === 'heading') {
      blocks.push({ type: 'heading', level: match[1].length, lines: [match[2]], closed: true });
    } else if (rule && previous?.type === rule.type && (rule.type !== 'quote' || !previous.closed)) {
      previous.lines.push(match[1]);
      previous.closed = false;
    } else if (rule) {
      blocks.push({ type: rule.type, lines: [match[1]] });
    } else if (previous?.type === 'p' && !previous.closed) {
      previous.lines.push(line);
    } else {
      blocks.push({ type: 'p', lines: [line] });
    }
  }

  return blocks;
}

const renderBlock = (block, index) => {
  switch (block.type) {
    case 'heading': {
      // The page title is the only h1; body headings start at h2.
      const Tag = `h${Math.min(Math.max(block.level, 2), 4)}`;
      return <Tag key={index}>{renderInline(block.lines[0])}</Tag>;
    }
    case 'ul':
    case 'ol': {
      const List = block.type;
      return (
        <List key={index}>
          {block.lines.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}
        </List>
      );
    }
    case 'quote':
      return <blockquote key={index}><p>{renderInline(block.lines.join(' '))}</p></blockquote>;
    default:
      return <p key={index}>{renderInline(block.lines.join(' '))}</p>;
  }
};

export const Markdown = ({ source }) => <>{parseBlocks(source).map(renderBlock)}</>;
