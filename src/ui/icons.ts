export type IconName = "copy" | "download" | "copy-text" | "list" | "clock" | "detail" | "markdown" | "close";

const ICON_PATHS: Record<IconName, string[]> = {
  copy: ["M10 8h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z", "M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"],
  download: ["M12 3v12", "m8 11 4 4 4-4", "M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"],
  "copy-text": ["M8 9h8", "M8 13h5", "M4 4h16v16H4z"],
  list: ["M5 5h14", "M5 12h14", "M5 19h14"],
  clock: ["M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0", "M12 7v5l3 2"],
  detail: ["M4 7h16", "M4 12h10", "M4 17h16", "m16 13 2 2 4-4"],
  markdown: ["M5 16V8l3 5 3-5v8", "M15 8h4l-4 4 4 4h-4"],
  close: ["M6 6l12 12", "M18 6 6 18"],
};

export function createIcon(name: IconName): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.8");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  for (const d of ICON_PATHS[name]) {
    const path = document.createElementNS(svg.namespaceURI, "path");
    path.setAttribute("d", d);
    svg.append(path);
  }
  return svg;
}

export function posterIcon(): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 28 28");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(svg.namespaceURI, "path");
  path.setAttribute("fill", "currentColor");
  path.setAttribute("fill-rule", "evenodd");
  path.setAttribute("d", "M7 2h14a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm2 16a1 1 0 0 0 0 2h10a1 1 0 0 0 0-2H9Zm0 4a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2H9Zm0-7h10l-3.4-4.7-2.2 2.7-1.7-2.1L9 15Zm3-7a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z");
  svg.append(path);
  return svg;
}
