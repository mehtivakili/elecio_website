/* eslint-disable @next/next/no-img-element -- sanitized CMS images may be responsive inline content, not fixed-layout covers */
import type { ReactNode } from 'react';
import type { RichDocument, RichNode } from '@/server/content/document';
import { brandedImagePath } from '@/lib/branded-image';

function renderChildren(node: RichNode, key: string): ReactNode {
  return (node.content ?? []).map((child, index) => renderNode(child, `${key}-${index}`));
}

function renderText(node: RichNode, key: string): ReactNode {
  let value: ReactNode = node.text ?? '';
  for (const mark of node.marks ?? []) {
    if (mark.type === 'bold') value = <strong>{value}</strong>;
    if (mark.type === 'italic') value = <em>{value}</em>;
    if (mark.type === 'code') value = <code>{value}</code>;
    if (mark.type === 'link') value = <a href={mark.attrs?.href ?? '#'} rel="noopener noreferrer">{value}</a>;
  }
  return <span key={key}>{value}</span>;
}

function renderNode(node: RichNode, key: string): ReactNode {
  if (node.type === 'text') return renderText(node, key);
  const content = renderChildren(node, key);
  switch (node.type) {
    case 'paragraph': return <p key={key}>{content}</p>;
    case 'heading': {
      const level = Number(node.attrs?.level) || 2;
      if (level === 3) return <h3 key={key}>{content}</h3>;
      if (level === 4) return <h4 key={key}>{content}</h4>;
      return <h2 key={key}>{content}</h2>;
    }
    case 'bulletList': return <ul key={key}>{content}</ul>;
    case 'orderedList': return <ol key={key}>{content}</ol>;
    case 'listItem': return <li key={key}>{content}</li>;
    case 'table': return <div key={key} className="rich-table-scroll"><table><tbody>{content}</tbody></table></div>;
    case 'tableRow': return <tr key={key}>{content}</tr>;
    case 'tableHeader': return <th key={key} scope="col">{content}</th>;
    case 'tableCell': return <td key={key}>{content}</td>;
    case 'blockquote': return <blockquote key={key}>{content}</blockquote>;
    case 'codeBlock': return <pre key={key}><code>{content}</code></pre>;
    case 'horizontalRule': return <hr key={key} />;
    case 'hardBreak': return <br key={key} />;
    case 'image': {
      const title = typeof node.attrs?.title === 'string' ? node.attrs.title : '';
      return <figure key={key}><img src={brandedImagePath(String(node.attrs?.src ?? ''))} alt={String(node.attrs?.alt ?? '')} loading="lazy" decoding="async" />{title && <figcaption>{title}</figcaption>}</figure>;
    }
    default: return null;
  }
}

export function RichContent({ document }: { document: RichDocument }) {
  return <>{(document.content ?? []).map((node, index) => renderNode(node, String(index)))}</>;
}
