export type IconName = "poster" | "copy" | "download" | "copy-text" | "list" | "clock" | "detail" | "markdown" | "close";

const ICON_PATHS: Record<IconName, string[]> = {
  poster: ["M4 5.5h16v13H4z", "M7 15l3.2-3.4 2.4 2.4 1.8-1.9 2.6 2.7", "M8.4 8.4h.01"],
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
  return createIcon("poster");
}
