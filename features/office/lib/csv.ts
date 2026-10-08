/**
 * Small CSV export helper for office views.
 * Triggers a client-side download of the given rows.
 *
 * Cells are sanitized against CSV formula injection (OWASP): any value whose
 * first character is `=`, `+`, `-`, `@`, tab or carriage return gets a
 * leading single quote, so spreadsheet apps treat it as text instead of
 * executing it as a formula. Quoting alone does NOT stop formula execution,
 * hence the prefix.
 */
export function exportToCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number>>
): void {
  const sanitizeFormula = (str: string): string => {
    // Also strip leading control chars an attacker could use to dodge the
    // first-character check after the file is opened.
    const trimmed = str.replace(/^[\u0000-\u0020]+/, '');
    return /^[=+\-@\t\r]/.test(trimmed) ? `'${str}` : str;
  };

  const escape = (value: string | number) => {
    const str = sanitizeFormula(String(value ?? ''));
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const csv = [
    headers.map(escape).join(','),
    ...rows.map((row) => row.map(escape).join(',')),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
