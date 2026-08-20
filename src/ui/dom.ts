export function element<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function appendRow(parent: HTMLElement, label: string, value: string): void {
  const row = element("div", "bsp-snapshot-row");
  row.append(element("span", "", label), element("strong", "", value));
  parent.append(row);
}
