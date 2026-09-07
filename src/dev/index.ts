import "../index";
import { element } from "../ui/dom";

// A separate build entry: no production module imports this directory.
const drawer = element("details");
drawer.id = "bsp-debug-drawer";
drawer.style.cssText = "position:fixed;left:12px;bottom:12px;z-index:2147483647;width:250px;padding:12px;background:#fff;color:#222;border:2px dashed #69717b;border-radius:8px;font:12px/1.5 monospace;box-shadow:0 4px 24px #0003";
drawer.append(element("summary", "", "DEBUG / 调试 · 仅开发构建"));
const note = element("p", "", "样例仅用于验证布局。更改场景后重新打开海报；关闭样例恢复真实数据。");
drawer.append(note);
const flags = new Map<string, HTMLInputElement>();
const originalPart = new URL(location.href).searchParams.get("p");
for (const [key, title] of [
  ["fixture", "使用样例数据"], ["title", "长标题"],
  ["stats", "缺失统计"], ["part", "多分P"], ["cover", "封面缺失"],
  ["narrow", "窄面板"], ["motion", "减少动效"],
]) {
  const label = element("label");
  label.style.cssText = "display:block;margin:6px 0";
  const input = element("input");
  input.type = "checkbox";
  input.dataset.scenario = key;
  flags.set(key, input);
  label.append(input, document.createTextNode(` ${title}`));
  drawer.append(label);
  input.addEventListener("change", () => {
    document.querySelector<HTMLButtonElement>(".bsp-close")?.click();
    document.documentElement.classList.toggle(`bsp-debug-${key}`, input.checked);
    if (key === "part" || key === "fixture") {
      const url = new URL(location.href);
      if (flags.get("fixture")?.checked && flags.get("part")?.checked) url.searchParams.set("p", "2");
      else if (originalPart) url.searchParams.set("p", originalPart);
      else url.searchParams.delete("p");
      history.replaceState(history.state, "", url);
      window.dispatchEvent(new Event("urlchange"));
    }
  });
}
const enabled = (key: string) => flags.get(key)?.checked === true;
const style = element("style");
style.textContent = `
.bsp-debug-narrow .bsp-panel {width:min(360px,calc(100vw - 16px));}
.bsp-debug-narrow .bsp-workspace {grid-template-columns:1fr;min-height:0;}
.bsp-debug-narrow .bsp-controls {min-height:0;overflow:visible;}
.bsp-debug-motion .bsp-backdrop, .bsp-debug-motion .bsp-backdrop *, .bsp-debug-motion #bsp-entry {transition-duration:0ms!important;animation-duration:0ms!important;}
`;
document.head.append(style);
document.body.append(drawer);

const request = GM_xmlhttpRequest;
globalThis.GM_xmlhttpRequest = ((details: Tampermonkey.Request<unknown>) => {
  if (!enabled("fixture")) return request(details);
  const url = new URL(details.url);
  const timer = window.setTimeout(async () => {
    let responseText = "";
    let response: unknown;
    let finalUrl = details.url;
    if (url.pathname === "/x/web-interface/view") {
      const bvid = url.searchParams.get("bvid");
      const part = Number(new URL(location.href).searchParams.get("p") || "1");
      responseText = JSON.stringify({ code: 0, data: {
        bvid, aid: 170001,
        title: enabled("title") ? "【视觉样例】从晨光到星河，记录城市里那些容易被忽略的细节与日常瞬间——这是一段用于验证长标题排版的公开样例" : "【视觉样例】把日常里的光，留在这一帧",
        pic: "https://i0.hdslb.com/bfs/archive/bsp-debug-fixture.png",
        owner: { name: "影像记录者" },
        stat: enabled("stats") ? {} : { view: 12345678, like: 98765, coin: 3456, favorite: 7890 },
        pages: [{ page: part, part: enabled("part") ? "城市漫游 · 第二章" : "正片" }],
      } });
    } else if (url.hostname.endsWith("hdslb.com")) {
      const canvas = document.createElement("canvas");
      canvas.width = enabled("cover") ? 1 : 640;
      canvas.height = enabled("cover") ? 1 : 360;
      const context = canvas.getContext("2d")!;
      if (!enabled("cover")) {
        context.fillStyle = "#9ba6ac"; context.fillRect(0, 0, 640, 360);
        context.fillStyle = "#e8d8bb"; context.beginPath(); context.arc(460, 105, 45, 0, Math.PI * 2); context.fill();
        context.fillStyle = "#37474c";
        for (let i = 0; i < 9; i++) context.fillRect(i * 80, 210 - (i % 3) * 35, 65, 180);
      }
      response = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));
    } else {
      const error = { error: "开发样例未定义此请求" } as Tampermonkey.ErrorResponse;
      details.onerror?.call(error, error);
      return;
    }
    const result = { status: 200, responseText, response, finalUrl } as Tampermonkey.Response<unknown>;
    details.onload?.call(result, result);
  }, 180);
  return { abort: () => clearTimeout(timer) };
}) as typeof GM_xmlhttpRequest;
