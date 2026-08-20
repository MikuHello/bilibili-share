export type IconName = "poster" | "copy" | "download" | "copy-text" | "combined" | "list" | "clock" | "detail" | "markdown" | "close";

const ICON_PATHS: Record<IconName, string[]> = {
  poster: ["M4 5.5h16v13H4z", "M7 15l3.2-3.4 2.4 2.4 1.8-1.9 2.6 2.7", "M8.4 8.4h.01"],
  copy: ["M8 8h11v11H8z", "M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"],
  download: ["M12 3v11", "m7 10 5 5 5-5", "M4 19h16"],
  "copy-text": ["M8 9h8", "M8 13h5", "M4 4h16v16H4z"],
  combined: ["M3 5h12v9H3z", "M6 9h6", "M6 12h4", "M17 9v10a2 2 0 0 1-2 2H7"],
  list: ["M8 6h12", "M8 12h12", "M8 18h12", "M4 6h.01", "M4 12h.01", "M4 18h.01"],
  clock: ["M12 12a9 9 0 1 1 0 .01", "M12 7v5l3 2"],
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
