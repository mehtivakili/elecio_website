export type RichMark = { type: 'bold' | 'italic' | 'code' | 'link'; attrs?: { href?: string } };
export type RichNode = { type: string; attrs?: Record<string, unknown>; marks?: RichMark[]; text?: string; content?: RichNode[] };
export type RichDocument = { type: 'doc'; content?: RichNode[] };
const blocks = new Set(['paragraph','heading','bulletList','orderedList','listItem','blockquote','codeBlock','horizontalRule','image','hardBreak']);
const marks = new Set(['bold','italic','code','link']);
function safeUrl(value: unknown, image = false): string | null { if (typeof value !== 'string' || value.length > 2048) return null; if (value.startsWith('/') && !value.startsWith('//')) return value; try { const url=new URL(value); if (image ? url.protocol === 'https:' : ['https:','http:','mailto:'].includes(url.protocol)) return value; } catch {} return null; }
function clean(node: unknown, depth = 0): RichNode | null { if (!node || typeof node !== 'object' || depth > 20) return null; const raw=node as RichNode;if(raw.type==='text'){if(typeof raw.text!=='string')return null;return{type:'text',text:raw.text.slice(0,20000),marks:(raw.marks??[]).filter(mark=>marks.has(mark.type)).map(mark=>mark.type==='link'?{type:'link' as const,attrs:{href:safeUrl(mark.attrs?.href)??'#'}}:{type:mark.type})};}if(!blocks.has(raw.type)&&raw.type!=='doc')return null;const attrs:Record<string,unknown>={};if(raw.type==='heading')attrs.level=Math.min(4,Math.max(2,Number(raw.attrs?.level)||2));if(raw.type==='image'){const src=safeUrl(raw.attrs?.src,true);if(!src)return null;attrs.src=src;attrs.alt=typeof raw.attrs?.alt==='string'?raw.attrs.alt.slice(0,500):'';attrs.title=typeof raw.attrs?.title==='string'?raw.attrs.title.slice(0,500):'';}return{type:raw.type,...(Object.keys(attrs).length?{attrs}:{}),content:(raw.content??[]).slice(0,1000).map(child=>clean(child,depth+1)).filter((child):child is RichNode=>Boolean(child))};}
export function sanitizeDocument(value: unknown): RichDocument { const parsed=typeof value==='string'?JSON.parse(value):value;const root=clean(parsed);if(!root||root.type!=='doc')throw new Error('INVALID_DOCUMENT');const serialized=JSON.stringify(root);if(serialized.length>500000)throw new Error('DOCUMENT_TOO_LARGE');return root as RichDocument; }
export function plainText(document: RichDocument): string { const collect=(node:RichNode):string=>node.type==='text'?node.text??'':`${(node.content??[]).map(collect).join(' ')}${node.type==='paragraph'||node.type==='heading'?' ':''}`;return collect(document).replace(/\s+/g,' ').trim(); }
export function isValidSlug(value:string){return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)&&value.length<=180;}

function nodeText(node: RichNode): string {
  return node.type === 'text' ? node.text ?? '' : (node.content ?? []).map(nodeText).join('');
}

export function extractFaq(document: RichDocument): { question: string; answer: string }[] {
  const nodes = document.content ?? [];
  const marker = nodes.findIndex((node) => node.type === 'heading' && /س[ؤو]الات متداول|پرسش(?:‌| )های متداول|frequently asked questions|faq/i.test(nodeText(node)));
  if (marker < 0) return [];
  const result: { question: string; answer: string }[] = [];
  for (let index = marker + 1; index < nodes.length && result.length < 12; index += 1) {
    const node = nodes[index];
    if (node.type === 'heading' && Number(node.attrs?.level) === 2) break;
    if (node.type !== 'heading' || Number(node.attrs?.level) < 3) continue;
    const question = nodeText(node).trim();
    const answers: string[] = [];
    for (let answerIndex = index + 1; answerIndex < nodes.length; answerIndex += 1) {
      const answerNode = nodes[answerIndex];
      if (answerNode.type === 'heading') break;
      const text = nodeText(answerNode).replace(/\s+/g, ' ').trim();
      if (text) answers.push(text);
    }
    const answer = answers.join(' ').slice(0, 3000);
    if (question && answer) result.push({ question: question.slice(0, 500), answer });
  }
  return result;
}
