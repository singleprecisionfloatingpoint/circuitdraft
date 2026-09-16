import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { COMPONENTS } from '../data/components.jsx';
import { slug } from './utils.js';

export function getBounds(doc, pad = 90) {
  if (!doc?.nodes?.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const n of doc.nodes) {
    const c = COMPONENTS[n.type];
    if (!c) continue;
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + c.w);
    maxY = Math.max(maxY, n.y + c.h + 28); // room for the caption
  }

  if (!Number.isFinite(minX)) return null;

  return {
    x: minX - pad,
    y: minY - pad,
    width: Math.round(maxX - minX + pad * 2),
    height: Math.round(maxY - minY + pad * 2),
  };
}

export async function renderDiagram(worldEl, doc, opts = {}) {
  const bounds = getBounds(doc);
  if (!bounds) throw new Error('Nothing on the canvas to export');
  if (!worldEl) throw new Error('Canvas not ready');

  const longest = Math.max(bounds.width, bounds.height);
  const ratio = Math.min(opts.pixelRatio ?? 2, Math.max(1, 4096 / longest));

  return toPng(worldEl, {
    width: bounds.width,
    height: bounds.height,
    pixelRatio: ratio,
    backgroundColor: opts.background ?? '#080d18',
    cacheBust: true,
    style: {
      transform: `translate(${-bounds.x}px, ${-bounds.y}px)`,
      transformOrigin: '0 0',
    },
  });
}

export async function exportPNG(worldEl, doc, title) {
  const dataUrl = await renderDiagram(worldEl, doc, { pixelRatio: 2 });
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${slug(title)}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  return true;
}

export async function exportPDF(worldEl, doc, title) {
  const bounds = getBounds(doc);
  const dataUrl = await renderDiagram(worldEl, doc, { pixelRatio: 2 });

  const landscape = bounds.width >= bounds.height;
  const pdf = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'pt', format: 'a4' });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 36;
  const headerH = 42;

  // Header
  pdf.setFillColor(8, 13, 24);
  pdf.rect(0, 0, pageW, pageH, 'F');

  pdf.setTextColor(220, 232, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.text(title || 'Wiring Diagram', margin, margin + 4);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(130, 150, 190);
  pdf.text(
    `VoltPad  •  generated ${new Date().toLocaleString()}  •  ${doc.nodes.length} components  •  ${doc.wires.length} conductors`,
    margin,
    margin + 18
  );

  const availW = pageW - margin * 2;
  const availH = pageH - margin * 2 - headerH;
  const scale = Math.min(availW / bounds.width, availH / bounds.height);
  const imgW = bounds.width * scale;
  const imgH = bounds.height * scale;
  const x = margin + (availW - imgW) / 2;
  const y = margin + headerH;

  pdf.addImage(dataUrl, 'PNG', x, y, imgW, imgH, undefined, 'FAST');

  pdf.setDrawColor(35, 50, 80);
  pdf.roundedRect(x - 4, y - 4, imgW + 8, imgH + 8, 6, 6, 'S');

  pdf.save(`${slug(title)}.pdf`);
  return true;
}
