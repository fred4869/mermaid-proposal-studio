# Mermaid Proposal Studio

一个零安装前端项目：输入 Mermaid 语法，实时预览，并导出适合产品方案汇报的高清 `SVG/PNG` 图片。

## 启动

```bash
cd /Users/alfred/mermaid-proposal-studio
node server.js
```

然后访问 `http://localhost:4173`。

## 功能

- Mermaid 实时预览
- 三套演示级配色
- `16:9`、`4:3`、`1:1` 画布比例
- 标题、副标题包装
- 高清 `SVG/PNG` 导出
- 路线图、流程图、用户旅程示例模板

## 说明

- 当前实现不需要 `npm install`。
- Mermaid 引擎通过浏览器端官方 CDN 加载，需要浏览器可以访问 `jsdelivr.net`。
- 如果后续要做完全离线版本，可以再把 Mermaid 改成本地依赖并加上截图服务。
