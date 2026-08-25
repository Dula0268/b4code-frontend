export function exportToCsv(filename: string, rows: Record<string, unknown>[]) {
    if (!rows.length) return;

    const headers = Object.keys(rows[0]);
    const escapeCell = (value: unknown) => {
        const str = value === null || value === undefined ? "" : String(value);
        return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };

    const csvLines = [
        headers.join(","),
        ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(",")),
    ];

    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
