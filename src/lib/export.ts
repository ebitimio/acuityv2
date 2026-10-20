export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function printDocument(title: string, bodyHtml: string): boolean {
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:-apple-system,"Segoe UI",Roboto,sans-serif;padding:32px;color:#111;max-width:720px;margin:auto}h1{font-size:22px;margin:0 0 4px}p.sub{color:#666;margin:0 0 20px;font-size:13px}table{width:100%;border-collapse:collapse;margin:12px 0}td,th{padding:9px 4px;border-bottom:1px solid #ddd;text-align:left;font-size:14px}td:last-child,th:last-child{text-align:right}.total td{font-weight:700;border-top:2px solid #111}.note{color:#666;font-size:12px;margin-top:28px;line-height:1.5}</style></head><body>${bodyHtml}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
  return true;
}
