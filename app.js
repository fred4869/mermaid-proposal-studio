const STORAGE_KEY = "mermaid-proposal-studio:v3";

const templates = {
  roadmap: `flowchart LR
    A[Q1 需求洞察] --> B[Q2 核心流程改版]
    B --> C[Q3 数据闭环]
    C --> D[Q4 规模化增长]
    A --> A1[用户访谈]
    A --> A2[漏斗诊断]
    B --> B1[支付页重构]
    B --> B2[风控提示优化]
    C --> C1[埋点体系]
    C --> C2[A/B 策略]
    D --> D1[渠道复制]
    D --> D2[会员联动]`,
  flow: `flowchart TD
    Start([进入支付页]) --> Choose{是否已有默认方式?}
    Choose -->|是| QuickPay[一键确认]
    Choose -->|否| SelectMethod[选择支付方式]
    SelectMethod --> Verify{是否需要验证?}
    Verify -->|需要| VerifyStep[短信/生物识别]
    Verify -->|不需要| Pay[发起支付]
    VerifyStep --> Pay
    Pay --> Result{结果}
    Result -->|成功| Success([支付成功])
    Result -->|失败| Retry[失败挽回提示]
    Retry --> SelectMethod`,
  journey: `journey
    title 新支付产品用户旅程
    section 发现阶段
      用户浏览活动页: 4: 用户
      看到支付权益说明: 5: 用户, 运营
    section 下单阶段
      选择商品并确认订单: 5: 用户
      对比支付方式权益: 3: 用户, 产品
    section 支付阶段
      一键完成支付: 5: 用户, 支付系统
      收到成功反馈: 5: 用户, 消息系统
    section 复购阶段
      查看订单和返利: 4: 用户
      参与复购激励: 5: 用户, 运营`
};

const palettes = {
  aurora: {
    frameStart: "#0f274d",
    frameEnd: "#183b6f",
    accent: "#2f74ff",
    accentStrong: "#78afff",
    cardBg: "rgba(251, 253, 255, 0.97)",
    mermaidTheme: {
      primaryColor: "#f4f8ff",
      primaryTextColor: "#15345b",
      primaryBorderColor: "#7fa4dd",
      lineColor: "#4f78b0",
      secondaryColor: "#ebf3ff",
      tertiaryColor: "#f8fbff",
      clusterBkg: "#f2f7ff",
      clusterBorder: "#b7cae6",
      fontFamily: "Noto Sans SC, PingFang SC, sans-serif"
    }
  },
  sunset: {
    frameStart: "#34121c",
    frameEnd: "#7a3d24",
    accent: "#ff8d6b",
    accentStrong: "#ffd36b",
    cardBg: "rgba(255, 248, 243, 0.94)",
    mermaidTheme: {
      primaryColor: "#fff4ee",
      primaryTextColor: "#522314",
      primaryBorderColor: "#ffaf8d",
      lineColor: "#be663e",
      secondaryColor: "#ffe2d6",
      tertiaryColor: "#fff9f5",
      clusterBkg: "#fff1ea",
      clusterBorder: "#f4b28f",
      fontFamily: "Noto Sans SC, PingFang SC, sans-serif"
    }
  },
  slate: {
    frameStart: "#101727",
    frameEnd: "#273249",
    accent: "#9ad0ff",
    accentStrong: "#c7f0ff",
    cardBg: "rgba(245, 248, 252, 0.95)",
    mermaidTheme: {
      primaryColor: "#f5f8fc",
      primaryTextColor: "#17263c",
      primaryBorderColor: "#8db2d6",
      lineColor: "#4b678f",
      secondaryColor: "#e6edf7",
      tertiaryColor: "#fbfdff",
      clusterBkg: "#eef3f8",
      clusterBorder: "#b3c5da",
      fontFamily: "Noto Sans SC, PingFang SC, sans-serif"
    }
  }
};

const ratios = {
  "16:9": { width: 1600, height: 900, aspect: "16 / 9" },
  "4:3": { width: 1600, height: 1200, aspect: "4 / 3" },
  "1:1": { width: 1600, height: 1600, aspect: "1 / 1" }
};

const els = {
  diagramList: document.querySelector("#diagram-list"),
  newDiagramBtn: document.querySelector("#new-diagram-btn"),
  duplicateDiagramBtn: document.querySelector("#duplicate-diagram-btn"),
  deleteDiagramBtn: document.querySelector("#delete-diagram-btn"),
  clearCacheBtn: document.querySelector("#clear-cache-btn"),
  title: document.querySelector("#diagram-title"),
  subtitle: document.querySelector("#diagram-subtitle"),
  footerLeftInput: document.querySelector("#footer-left-input"),
  footerRightInput: document.querySelector("#footer-right-input"),
  palette: document.querySelector("#palette-select"),
  ratio: document.querySelector("#ratio-select"),
  input: document.querySelector("#mermaid-input"),
  optimizeBtn: document.querySelector("#optimize-btn"),
  toggleOptimizedBtn: document.querySelector("#toggle-optimized-btn"),
  applyOptimizedBtn: document.querySelector("#apply-optimized-btn"),
  renderBtn: document.querySelector("#render-btn"),
  resetBtn: document.querySelector("#format-btn"),
  downloadSvgBtn: document.querySelector("#download-svg-btn"),
  downloadPngBtn: document.querySelector("#download-png-btn"),
  fullscreenBtn: document.querySelector("#fullscreen-btn"),
  status: document.querySelector("#status-text"),
  mount: document.querySelector("#diagram-mount"),
  previewTitle: document.querySelector("#preview-title"),
  previewSubtitle: document.querySelector("#preview-subtitle"),
  footerLeft: document.querySelector("#footer-left"),
  footerRight: document.querySelector("#footer-right"),
  exportFrame: document.querySelector("#export-frame"),
  canvasMeta: document.querySelector("#canvas-meta")
};

let mermaidApi;
let renderNonce = 0;
let state = loadState();

document.querySelectorAll(".template-chip").forEach((button) => {
  button.addEventListener("click", () => {
    updateCurrentDiagram({
      mermaid: templates[button.dataset.template] || templates.roadmap,
      templateKey: button.dataset.template
    });
    syncFormFromState();
    renderDiagram();
  });
});

els.resetBtn.addEventListener("click", () => {
  const current = getCurrentDiagram();
  updateCurrentDiagram({
    ...makeDefaultDiagram(),
    id: current.id
  });
  syncFormFromState();
  renderDiagram();
});

els.optimizeBtn.addEventListener("click", () => {
  const current = getCurrentDiagram();
  const optimizedMermaid = optimizeMermaidSource(els.input.value);
  updateCurrentDiagram({
    optimizedMermaid,
    previewMode: "optimized"
  });
  syncFormFromState();
  renderDiagram();
});

els.toggleOptimizedBtn.addEventListener("click", () => {
  const current = getCurrentDiagram();
  if (!current.optimizedMermaid?.trim()) {
    const optimizedMermaid = optimizeMermaidSource(els.input.value);
    updateCurrentDiagram({
      optimizedMermaid,
      previewMode: "optimized"
    });
  } else {
    updateCurrentDiagram({
      previewMode: current.previewMode === "optimized" ? "original" : "optimized"
    });
  }
  syncFormFromState();
  renderDiagram();
});

els.applyOptimizedBtn.addEventListener("click", () => {
  const current = getCurrentDiagram();
  if (!current.optimizedMermaid?.trim()) {
    return;
  }
  updateCurrentDiagram({
    mermaid: current.optimizedMermaid,
    optimizedMermaid: "",
    previewMode: "original"
  });
  syncFormFromState();
  renderDiagram();
});

els.newDiagramBtn.addEventListener("click", createDiagram);
els.duplicateDiagramBtn.addEventListener("click", duplicateDiagram);
els.deleteDiagramBtn.addEventListener("click", deleteCurrentDiagram);
els.clearCacheBtn.addEventListener("click", clearCache);

["input", "change"].forEach((eventName) => {
  els.title.addEventListener(eventName, handleFieldChange);
  els.subtitle.addEventListener(eventName, handleFieldChange);
  els.footerLeftInput.addEventListener(eventName, handleFieldChange);
  els.footerRightInput.addEventListener(eventName, handleFieldChange);
});

els.palette.addEventListener("change", () => {
  handleFieldChange();
  renderDiagram();
});
els.ratio.addEventListener("change", () => {
  handleFieldChange();
  applyRatio();
});
els.renderBtn.addEventListener("click", renderDiagram);
els.downloadSvgBtn.addEventListener("click", downloadSvg);
els.downloadPngBtn.addEventListener("click", downloadPng);
els.fullscreenBtn.addEventListener("click", toggleFullscreen);

const debouncedRender = debounce(renderDiagram, 500);
els.input.addEventListener("input", () => {
  handleFieldChange();
  debouncedRender();
});

boot();

async function boot() {
  try {
    setStatus("正在加载 Mermaid 引擎...");
    mermaidApi = await import("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs");
    mermaidApi.default.initialize({
      startOnLoad: false,
      securityLevel: "loose"
    });
    syncFormFromState();
    applyRatio(false);
    await renderDiagram();
  } catch (error) {
    showError("Mermaid 加载失败。请确认当前浏览器可访问 jsDelivr CDN。");
    console.error(error);
  }
}

function syncFormFromState() {
  const current = getCurrentDiagram();
  els.title.value = current.title;
  els.subtitle.value = current.subtitle;
  els.footerLeftInput.value = current.footerLeft;
  els.footerRightInput.value = current.footerRight;
  els.palette.value = current.palette;
  els.ratio.value = current.ratio;
  els.input.value = current.mermaid;
  els.toggleOptimizedBtn.textContent =
    current.previewMode === "optimized" ? "预览原文版" : "预览优化版";
  els.toggleOptimizedBtn.disabled = !current.optimizedMermaid?.trim() && !current.mermaid.trim();
  els.applyOptimizedBtn.disabled = !current.optimizedMermaid?.trim();
  syncFrameText();
  renderDiagramList();
}

function syncFrameText() {
  const current = getCurrentDiagram();
  els.previewTitle.textContent = current.title.trim() || "未命名方案";
  els.previewSubtitle.textContent = current.subtitle.trim() || "请输入副标题";
  els.footerLeft.textContent = current.footerLeft;
  els.footerRight.textContent = current.footerRight;
}

function handleFieldChange() {
  updateCurrentDiagram({
    title: els.title.value,
    subtitle: els.subtitle.value,
    footerLeft: els.footerLeftInput.value,
    footerRight: els.footerRightInput.value,
    palette: els.palette.value,
    ratio: els.ratio.value,
    mermaid: els.input.value,
    optimizedMermaid: "",
    previewMode: "original"
  });
  syncFrameText();
  renderDiagramList();
}

function renderDiagramList() {
  els.diagramList.innerHTML = "";
  state.diagrams.forEach((diagram, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `diagram-item${diagram.id === state.activeId ? " is-active" : ""}`;
    button.innerHTML = `
      <span class="diagram-item-title">${escapeHtml(diagram.title || `未命名方案 ${index + 1}`)}</span>
      <span class="diagram-item-meta">${escapeHtml(diagram.ratio)} · ${escapeHtml(diagram.palette)}</span>
    `;
    button.addEventListener("click", () => {
      state.activeId = diagram.id;
      persistState();
      syncFormFromState();
      applyRatio();
    });
    els.diagramList.append(button);
  });
}

function applyPalette() {
  const palette = palettes[getCurrentDiagram().palette];
  const root = document.documentElement;
  root.style.setProperty("--frame-start", palette.frameStart);
  root.style.setProperty("--frame-end", palette.frameEnd);
  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--accent-strong", palette.accentStrong);
  root.style.setProperty("--card-bg", palette.cardBg);
}

function applyRatio(shouldRender = true) {
  const ratio = ratios[getCurrentDiagram().ratio];
  els.exportFrame.style.aspectRatio = ratio.aspect;
  els.canvasMeta.textContent = `${ratio.width} × ${ratio.height}`;
  if (shouldRender) renderDiagram();
}

async function renderDiagram() {
  syncFrameText();
  applyPalette();

  if (!mermaidApi) return;

  const current = getCurrentDiagram();
  const source = getActiveMermaidSource(current).trim();
  if (!source) {
    showError("请输入 Mermaid 语法。");
    return;
  }

  const currentId = `diagram-${Date.now()}-${renderNonce++}`;
  const palette = palettes[current.palette];

  try {
    setStatus("正在渲染预览...");
    els.exportFrame.classList.remove("is-error");
    mermaidApi.default.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: "base",
      themeVariables: palette.mermaidTheme
    });
    const { svg } = await mermaidApi.default.render(currentId, source, undefined, document.createElement("div"));
    els.mount.innerHTML = svg;
    postProcessSvg(els.mount.querySelector("svg"), palette);
    setStatus(current.previewMode === "optimized" ? "优化预览已更新，当前图纸已自动缓存。" : "预览已更新，当前图纸已自动缓存。");
  } catch (error) {
    showError(error?.message || "Mermaid 语法有误，请检查后重试。");
    console.error(error);
  }
}

function postProcessSvg(svg, palette) {
  if (!svg) return;
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.style.maxWidth = "100%";
  svg.style.height = "auto";
  svg.style.fontFamily = "Noto Sans SC, PingFang SC, sans-serif";
  svg.style.overflow = "visible";

  svg.querySelectorAll("rect, polygon, path, circle, ellipse").forEach((node) => {
    if (node.tagName === "rect") {
      node.setAttribute("rx", node.getAttribute("rx") || "12");
      node.setAttribute("ry", node.getAttribute("ry") || "12");
    }
    if (node.getAttribute("stroke")) {
      node.setAttribute("stroke-width", "1.6");
      node.setAttribute("stroke-linecap", "round");
      node.setAttribute("stroke-linejoin", "round");
    }
  });

  ["rect.er", "polygon", "rect", "circle", "ellipse"].forEach((selector) => {
    svg.querySelectorAll(selector).forEach((node) => {
      if (!node.getAttribute("fill") || node.getAttribute("fill") === "none") return;
      node.style.filter = "drop-shadow(0 2px 8px rgba(18, 51, 95, 0.08))";
    });
  });

  svg.querySelectorAll("text").forEach((node) => {
    node.setAttribute("fill", palette.mermaidTheme.primaryTextColor);
    node.setAttribute("font-size", node.getAttribute("font-size") || "15");
    node.setAttribute("font-weight", "600");
  });

  svg.querySelectorAll(".edgeLabel rect, .labelBkg").forEach((node) => {
    node.setAttribute("rx", "8");
    node.setAttribute("ry", "8");
    node.setAttribute("fill", "#ffffff");
    node.setAttribute("stroke", "rgba(21,52,91,0.08)");
  });

  svg.querySelectorAll(".nodeLabel, .edgeLabel, .cluster-label text").forEach((node) => {
    node.setAttribute("fill", palette.mermaidTheme.primaryTextColor);
  });

  svg.querySelectorAll(".flowchart-link, .marker, .path").forEach((node) => {
    if (node.getAttribute("stroke")) {
      node.setAttribute("stroke", palette.mermaidTheme.lineColor);
    }
  });
}

function showError(message) {
  els.exportFrame.classList.add("is-error");
  els.mount.innerHTML = `<div class="error-box">${escapeHtml(message)}</div>`;
  setStatus("当前预览不可导出，请先修正 Mermaid 语法。");
}

function setStatus(message) {
  els.status.textContent = message;
}

function getActiveMermaidSource(current = getCurrentDiagram()) {
  return current.previewMode === "optimized" && current.optimizedMermaid?.trim()
    ? current.optimizedMermaid
    : current.mermaid;
}

function optimizeMermaidSource(source) {
  const trimmed = String(source || "").trim();
  if (!trimmed) return "";

  if (/^(flowchart|graph)\b/i.test(trimmed)) {
    return optimizeFlowchart(trimmed);
  }
  if (/^journey\b/i.test(trimmed)) {
    return optimizeJourney(trimmed);
  }
  return trimmed;
}

function optimizeFlowchart(source) {
  const lines = source.split("\n").map((line) => line.replace(/\t/g, "  ").trimEnd());
  return lines
    .map((line, index) => {
      if (index === 0) {
        return line.replace(/\s+/g, " ").replace(/\bgraph\b/i, "flowchart");
      }

      let nextLine = line.trim();
      if (!nextLine) return "";

      nextLine = nextLine
        .replace(/\[(.*?)\]/g, (_, label) => `[${wrapMermaidLabel(label)}]`)
        .replace(/\{(.*?)\}/g, (_, label) => `{${wrapMermaidLabel(label)}}`)
        .replace(/\(\[(.*?)\]\)/g, (_, label) => `([${wrapMermaidLabel(label)}])`)
        .replace(/\(\((.*?)\)\)/g, (_, label) => `((${wrapMermaidLabel(label)}))`)
        .replace(/\|(.*?)\|/g, (_, label) => `|${shortenEdgeLabel(label)}|`);

      return `  ${nextLine}`;
    })
    .filter((line, index, all) => !(line === "" && all[index - 1] === ""))
    .join("\n")
    .trim();
}

function optimizeJourney(source) {
  return source
    .split("\n")
    .map((line, index) => {
      if (index <= 1) return line.trimEnd();
      const trimmed = line.trim();
      if (!trimmed || /^section\b/i.test(trimmed)) {
        return trimmed ? `  ${trimmed}` : "";
      }
      const parts = trimmed.split(":");
      if (parts.length < 2) {
        return `    ${trimmed}`;
      }
      const [step, ...rest] = parts;
      return `    ${wrapMermaidLabel(step, 10)}: ${rest.join(":").trim()}`;
    })
    .join("\n")
    .trim();
}

function wrapMermaidLabel(text, maxLineLength = 8) {
  const normalized = String(text || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized || normalized.includes("\n")) {
    return normalized.replace(/\n/g, "<br/>");
  }
  if (normalized.length <= maxLineLength + 2) {
    return normalized;
  }

  const tokens = normalized
    .split(/([\/、，,：:·\-\s])/)
    .filter(Boolean)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length <= 1) {
    return splitPlainText(normalized, maxLineLength).join("<br/>");
  }

  const lines = [];
  let current = "";
  tokens.forEach((token) => {
    const next = current ? `${current}${token}` : token;
    if (next.replace(/\s+/g, "").length > maxLineLength && current) {
      lines.push(current.trim());
      current = token;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current.trim());
  return lines.join("<br/>");
}

function splitPlainText(text, maxLineLength) {
  const chars = Array.from(text);
  const lines = [];
  for (let i = 0; i < chars.length; i += maxLineLength) {
    lines.push(chars.slice(i, i + maxLineLength).join(""));
  }
  return lines;
}

function shortenEdgeLabel(text) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= 8) return normalized;
  return `${normalized.slice(0, 8)}…`;
}

async function downloadSvg() {
  const svgText = buildExportSvg();
  if (!svgText) return;
  downloadBlob(new Blob([svgText], { type: "image/svg+xml;charset=utf-8" }), makeFileName("svg"));
}

async function downloadPng() {
  const svgText = buildExportSvg();
  if (!svgText) return;

  const ratio = ratios[getCurrentDiagram().ratio];
  const image = new Image();
  const svgDataUrl = `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svgText)))}`;

  setStatus("正在生成 PNG...");

  image.onload = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = ratio.width * 2;
      canvas.height = ratio.height * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setStatus("当前浏览器不支持 Canvas 导出。");
        return;
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      if (canvas.toBlob) {
        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            downloadBlob(pngBlob, makeFileName("png"));
            setStatus("PNG 已导出。");
            return;
          }
          downloadDataUrl(canvas.toDataURL("image/png"), makeFileName("png"));
          setStatus("PNG 已导出。");
        }, "image/png");
        return;
      }

      downloadDataUrl(canvas.toDataURL("image/png"), makeFileName("png"));
      setStatus("PNG 已导出。");
    } catch (error) {
      console.error(error);
      setStatus("PNG 导出失败，请优先使用 SVG。");
    }
  };

  image.onerror = () => {
    setStatus("PNG 导出失败，浏览器未能加载导出的 SVG 画布。");
  };

  image.src = svgDataUrl;
}

function buildExportSvg() {
  const diagramSvg = els.mount.querySelector("svg");
  if (!diagramSvg) {
    setStatus("当前没有可导出的图像。");
    return "";
  }

  const current = getCurrentDiagram();
  const ratio = ratios[current.ratio];
  const palette = palettes[current.palette];
  const title = escapeXml(els.previewTitle.textContent);
  const subtitleLines = wrapLines(els.previewSubtitle.textContent, 18, 3);
  const footerLeft = escapeXml(els.footerLeft.textContent);
  const footerRight = escapeXml(els.footerRight.textContent);
  const embeddedDiagram = buildEmbeddedDiagramMarkup(diagramSvg, ratio);
  const subtitleX = 68;
  const subtitleY = ratio.height > 1000 ? 174 : 162;
  const subtitleFontSize = ratio.height > 1000 ? 24 : 19;
  const titleFontSize = ratio.height > 1000 ? 54 : 44;
  const cardY = ratio.height > 1000 ? 232 : 212;
  const cardHeight = ratio.height - cardY - 92;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${ratio.width}" height="${ratio.height}" viewBox="0 0 ${ratio.width} ${ratio.height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.frameStart}" />
      <stop offset="100%" stop-color="${palette.frameEnd}" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${palette.accent}" />
      <stop offset="100%" stop-color="${palette.accentStrong}" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="24" stdDeviation="24" flood-color="#000000" flood-opacity="0.18"/>
    </filter>
    <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
      <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${ratio.width}" height="${ratio.height}" rx="28" fill="url(#bg)" />
  <g opacity="0.1">
    <path d="M0 0 H${ratio.width} V${Math.round(ratio.height * 0.18)} Q${Math.round(ratio.width * 0.72)} ${Math.round(ratio.height * 0.26)} ${Math.round(ratio.width * 0.44)} ${Math.round(ratio.height * 0.18)} T0 ${Math.round(ratio.height * 0.24)} Z" fill="#ffffff"/>
  </g>
  <rect width="${ratio.width}" height="${Math.round(ratio.height * 0.24)}" fill="url(#grid)" opacity="0.35"/>
  <text x="68" y="72" fill="${palette.accentStrong}" font-size="20" font-family="Manrope, Noto Sans SC, sans-serif" font-weight="700" letter-spacing="4">PRODUCT BLUEPRINT</text>
  <text x="68" y="128" fill="#ffffff" font-size="${titleFontSize}" font-family="Manrope, Noto Sans SC, sans-serif" font-weight="800">${title}</text>
  <text x="${subtitleX}" y="${subtitleY}" fill="rgba(255,255,255,0.8)" font-size="${subtitleFontSize}" font-family="Noto Sans SC, sans-serif">${subtitleLines.map((line, index) => `<tspan x="${subtitleX}" dy="${index === 0 ? 0 : Math.round(subtitleFontSize * 1.6)}">${escapeXml(line)}</tspan>`).join("")}</text>
  <g filter="url(#shadow)">
    <rect x="52" y="${cardY}" width="${ratio.width - 104}" height="${cardHeight}" rx="30" fill="${palette.cardBg}" />
    <rect x="84" y="${cardY + 30}" width="140" height="10" rx="5" fill="url(#accent)" />
    ${embeddedDiagram}
  </g>
  ${footerLeft ? `<text x="68" y="${ratio.height - 34}" fill="rgba(255,255,255,0.65)" font-size="18" font-family="Noto Sans SC, sans-serif">${footerLeft}</text>` : ""}
  ${footerRight ? `<text x="${ratio.width - 68}" y="${ratio.height - 34}" fill="rgba(255,255,255,0.65)" font-size="18" font-family="Noto Sans SC, sans-serif" text-anchor="end">${footerRight}</text>` : ""}
</svg>`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadDataUrl(dataUrl, filename) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}

function makeFileName(extension) {
  const raw = (getCurrentDiagram().title.trim() || "mermaid-proposal")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return `${raw || "mermaid-proposal"}.${extension}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeXml(value) {
  return escapeHtml(value).replaceAll("\n", " ");
}

function debounce(fn, delay) {
  let timer = 0;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

function buildEmbeddedDiagramMarkup(diagramSvg, ratio) {
  const exportX = 72;
  const exportY = 236;
  const exportWidth = ratio.width - 144;
  const exportHeight = ratio.height - 332;
  const sourceViewBox = diagramSvg.viewBox?.baseVal;
  const sourceWidth = sourceViewBox?.width || Number(diagramSvg.getAttribute("width")) || 1200;
  const sourceHeight = sourceViewBox?.height || Number(diagramSvg.getAttribute("height")) || 800;
  const scale = Math.min(exportWidth / sourceWidth, exportHeight / sourceHeight);
  const scaledWidth = sourceWidth * scale;
  const scaledHeight = sourceHeight * scale;
  const x = exportX + (exportWidth - scaledWidth) / 2;
  const y = exportY + (exportHeight - scaledHeight) / 2;

  const clone = diagramSvg.cloneNode(true);
  clone.setAttribute("x", String(Math.round(x)));
  clone.setAttribute("y", String(Math.round(y)));
  clone.setAttribute("width", String(Math.round(scaledWidth)));
  clone.setAttribute("height", String(Math.round(scaledHeight)));
  clone.setAttribute("preserveAspectRatio", "xMidYMid meet");
  clone.removeAttribute("style");
  return new XMLSerializer().serializeToString(clone);
}

function wrapLines(text, maxChars, maxLines) {
  const normalized = (text || "").trim().replace(/\s+/g, " ");
  if (!normalized) return ["请输入副标题"];
  const lines = [];
  let buffer = "";
  for (const char of normalized) {
    buffer += char;
    if (buffer.length >= maxChars) {
      lines.push(buffer);
      buffer = "";
      if (lines.length === maxLines - 1) break;
    }
  }
  const remaining = normalized.slice(lines.join("").length);
  if (remaining) lines.push(remaining);
  else if (buffer) lines.push(buffer);
  return lines.slice(0, maxLines);
}

function getCurrentDiagram() {
  return state.diagrams.find((diagram) => diagram.id === state.activeId) || state.diagrams[0];
}

function updateCurrentDiagram(patch) {
  state.diagrams = state.diagrams.map((diagram) =>
    diagram.id === state.activeId ? { ...diagram, ...patch } : diagram
  );
  persistState();
}

function createDiagram() {
  const diagram = makeDefaultDiagram({
    title: `新方案图 ${state.diagrams.length + 1}`,
    subtitle: "请输入这张图的说明",
    mermaid: templates.flow,
    templateKey: "flow"
  });
  state.diagrams.unshift(diagram);
  state.activeId = diagram.id;
  persistState();
  syncFormFromState();
  applyRatio();
}

function duplicateDiagram() {
  const current = getCurrentDiagram();
  const copy = {
    ...current,
    id: createId(),
    title: `${current.title || "未命名方案"} 副本`
  };
  state.diagrams.unshift(copy);
  state.activeId = copy.id;
  persistState();
  syncFormFromState();
  applyRatio();
}

function deleteCurrentDiagram() {
  if (state.diagrams.length === 1) {
    state = createInitialState();
  } else {
    state.diagrams = state.diagrams.filter((diagram) => diagram.id !== state.activeId);
    state.activeId = state.diagrams[0].id;
  }
  persistState();
  syncFormFromState();
  applyRatio();
}

function clearCache() {
  localStorage.removeItem(STORAGE_KEY);
  state = createInitialState();
  persistState();
  syncFormFromState();
  applyRatio();
}

function createInitialState() {
  const initial = makeDefaultDiagram();
  return { activeId: initial.id, diagrams: [initial] };
}

function makeDefaultDiagram(overrides = {}) {
  return {
    id: createId(),
    title: "支付产品改版方案",
    subtitle: "覆盖需求洞察、流程改造与上线节奏",
    footerLeft: "Generated with Mermaid Proposal Studio",
    footerRight: new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(new Date()),
    palette: "aurora",
    ratio: "16:9",
    previewMode: "original",
    optimizedMermaid: "",
    mermaid: templates.roadmap,
    templateKey: "roadmap",
    ...overrides
  };
}

function createId() {
  return globalThis.crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.diagrams) || parsed.diagrams.length === 0) return createInitialState();
    const diagrams = parsed.diagrams.map((diagram) => ({
      ...makeDefaultDiagram(),
      ...diagram,
      id: diagram.id || createId()
    }));
    const activeId = diagrams.some((diagram) => diagram.id === parsed.activeId)
      ? parsed.activeId
      : diagrams[0].id;
    return { activeId, diagrams };
  } catch {
    return createInitialState();
  }
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function toggleFullscreen() {
  const target = els.exportFrame;
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await target.requestFullscreen();
  } catch (error) {
    console.error(error);
    setStatus("当前浏览器不支持全屏查看。");
  }
}
