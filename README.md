# 线索跟进记录（Lead Tracker）

星探线索管理工具：记录与持续跟进主播苗子。单页应用，数据保存在浏览器 localStorage，
无需后端即可使用；存储层做了接口抽象，后续可平滑升级到多人共享的云端方案。

## 功能

- 添加线索：名字、联系方式、来源渠道、初始状态
- 跟进记录：每条线索可追加多条跟进，自动带时间戳
- 状态看板：待联系 / 已联系 / 已约面 三列分组，状态可随时切换
- 未跟进提醒：待联系线索超过 3 天未跟进自动标红并置顶
- 搜索过滤：按名字 / 联系方式 / 来源实时过滤
- 编辑与删除：录错可改，删除有二次确认
- 导入 / 导出 JSON：数据备份与迁移
- PWA：可安装到手机桌面，离线可用
- 数据持久化：所有操作即时写入 localStorage，刷新不丢

## 技术栈

React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + zustand + Vitest + Playwright

## 目录结构

```
.
├── app/                      # 前端应用
│   ├── src/
│   │   ├── components/       # 组件（表单/看板/卡片/弹窗/工具栏）
│   │   ├── lib/              # 工具（时间/存储抽象）
│   │   ├── store/            # zustand store（含数据迁移容错）
│   │   ├── types.ts          # 数据模型
│   │   └── App.tsx
│   ├── e2e/                  # Playwright E2E 测试
│   └── vitest.config.ts      # 单测配置
└── .github/workflows/
    ├── ci.yml                # CI：lint + typecheck + 单测 + E2E + build
    └── cd.yml                # CD：main 分支构建并部署 GitHub Pages
```

## 本地开发

```bash
cd app
npm install
npm run dev        # http://localhost:5173
```

## 测试

```bash
cd app
npm test           # Vitest 单测（数据层/store）
npm run test:e2e   # Playwright E2E（真实浏览器，需先装 Chrome）
```

## 部署（GitHub Actions）

推送 main 分支后自动执行 CD：构建 → 上传 → 部署 GitHub Pages。
启用方式：仓库 Settings → Pages → Source 选 "GitHub Actions"。

## 数据存储设计

存储层定义 `LeadStorage` 接口（getItem/setItem/removeItem），当前使用 localStorage
实现。未来多人共享时新增远程实现（如 REST API / Supabase / 轻量后端），切换一行配置，
组件与 store 逻辑零改动。持久化数据带 version 字段，store 内置 migrate 容错迁移，
旧数据字段缺失时补默认值，不丢数据。
