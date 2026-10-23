# 《仙途》界面重设计 · 交接说明

日期：2026-10-21。对应游戏版本：第三十八批「百草铺交接版」。
本文件夹是一套**视觉方向稿**，不是代码补丁。目标读者是接下来在新会话里让模型改前端的人，以及模型本身。

## 1. 文件夹里有什么

| 文件 | 说明 |
|---|---|
| `01_桌面_场景页.html` / `.png` | 青石县商街场景页，对应现版 `.screenshots/batch38/desktop-succession.png` 的一比一重排 |
| `02_桌面_创角页.html` / `.png` | 创角页：道号、六种出身、大众/硬核模式选择（模式选择按 `设定与设计/07` 的方案画，现版代码没有） |
| `03_手机_场景页.html` / `.png` | 390 宽手机场景页 |
| `tokens.css` | 色彩、字体、间距变量，可直接 `@import` 或复制进皮肤文件 |
| `README.md` | 本文 |

三个 HTML 是独立静态页，双击即可打开，不依赖游戏代码。文字内容全部取自现版游戏的真实数据（沈行舟、商街、百草铺往来账、青石药讯），只是重新排版。
页面里的 Google Fonts 链接需要联网；离线时回落到系统宋体，效果略差但不影响判断布局。

## 2. 设计方向：宣纸、墨、朱砂

现版问题：背景、卡片、按钮、文字、底图全在 `#f5f4e7` 到 `#476b55` 这一小段灰绿里，没有层次，灰绿字压在米绿底上对比不足；组件是通用圆角卡片加描边按钮，与题材无关。

新方向的四条规则：

1. **底色暖米宣纸，正文近黑墨色。** 可读性第一，这是读字的游戏。
2. **朱砂只做一个强调色。** 只用于：当前选中项的边、关键数字（灵石、缺口数）、印章式标签（「急」「已选」「推荐」「灵气 0.7」）、主按钮。一个屏幕里朱砂不超过三处大面积。
3. **青绿退到只管进度条和成功状态。** 不再做背景、边框、文字色。
4. **卡片去圆角，细墨线。** 边框 1px `#C9B99A`，选中态 1.5px 朱砂；不用阴影、不用渐变按钮、不用左侧色条卡片（选中态的内侧 3px 朱砂线除外）。

底图不换，继续用 `prototype/assets/art/*.webp`，但透明度压到 0.1 以下，只留纹理感。

## 3. 色板与字体

完整变量见 `tokens.css`，核心如下：

| 用途 | 变量 | 值 |
|---|---|---|
| 页面底 | `--paper` | `#F3EBDC` |
| 卡片底 | `--paper-2` | `#FAF5EA` |
| 侧栏/次级底 | `--paper-3` | `#EDE3CF` |
| 正文 | `--ink` | `#1F1A17` |
| 次要文字 | `--ink-2` | `#4A4036` |
| 弱化文字 | `--ink-3` | `#7A6F62` |
| 边框 | `--line` | `#C9B99A` |
| 细分隔线 | `--line-2` | `#DCCFB4` |
| 朱砂 | `--vermilion` | `#B4321F` |
| 朱砂 hover | `--vermilion-dark` | `#8E2415` |
| 青绿（仅进度/成功） | `--jade` | `#3F7A5E` |
| 深色封面底（仅创角页左栏） | `--ink-bg` | `#1F1A17` |

对比度：`--ink-3` 在 `--paper` 上 4.6:1，`--vermilion` 在 `--paper` 上 6.1:1，均过 WCAG AA。

字体：正文 `"Noto Serif SC","Songti SC","SimSun",serif`，15px，行高 1.8；标题 700 字重加 `.12em` 到 `.14em` 字距；游戏名「仙途」用书法体 `Ma Shan Zheng`，旁边竖排朱砂底白字的「修行纪」印章。数字一律 `font-variant-numeric: tabular-nums`。

## 4. 组件对照：设计稿 → 现版选择器

现版样式分三层，按加载顺序后者覆盖前者：

1. `prototype/index.html` 第 7 到 787 行：原「墨夜青绿」深色基础样式，定义了 `:root` 变量和 `.hud` `.stat` `.act` `.choice` `.primary-nav` `.nav-tab` `.creation-sheet` `.opt` 等。
2. `prototype/index.html` 第 788 到 821 行：第三十二批「青绿山水长卷」浅色覆盖层，重写了 `:root` 和上述大部分类，大量 `!important`。
3. `prototype/assets/sandbox35.css`（16 行，每行一组）：场景沙盒层，`.sb-*` 系列。

| 设计稿里的元素 | 现版选择器 | 要改成 |
|---|---|---|
| 顶栏整体 | `.hud` | 去背景，底边 1px `--ink` |
| 「仙途」+ 印章 | `.hud-brand strong` / `.vermilion-seal` | 书法体 44px；印章 `--vermilion` 底、`--paper-2` 字 |
| 角色名 | `.name` | 26px 700 字重，`--ink` |
| 出身/灵根标签 | `.tag` `.tag.root` | 1px `--line` 边、`--ink-2` 字，无底色 |
| 境界名 + 进度条 | `.realm` `.bar` `.bar-fill` `.bar-text` | 境界名 `--ink` 600；条底 `--line-2`，填充纯色 `--jade`，去渐变 |
| 年龄/寿元/灵石 | `.stat .k` `.stat .v` | 数值 28px；灵石数值 `--vermilion` 700 |
| 场景页标题 | `.sb-head h2` `.sb-head small` | 34px 700，地点与动作之间用朱砂「·」 |
| 「山河地图」「本地委托」 | `.sb-location-tools .sb-btn` | 幽灵按钮：1px `--line` 边，hover 变 `--ink` 边 |
| 房间导航 | `.sb-rooms .sb-btn` / `.on` | 侧栏底 `--paper-3`；选中项左侧 3px `--vermilion`、底 `--paper-2`、600 字重 |
| 普通按钮 | `.sb-btn` `.act` `.mini` `.opt` | 1px `--ink` 边、`--paper-2` 底、无圆角；hover 反色 |
| 主按钮 | `.sb-btn.on` `.act.primary` `.act.solid` | `--vermilion` 底、`--paper-2` 字 |
| 人物条目 | `.sb-person` / `.on` | 1px `--line` 边；姓名 19px 700；选中态 `--vermilion` 边加内侧 3px 线 |
| 右栏告示卡 | `.sb-card` `.sb-card h4` | 无圆角；标题 18px 700，标题右侧延伸一条 `--line` 横线 |
| 小节标签「眼前的人」 | `.sb-section` | 13px `--ink-3` `.16em` 字距，右侧延伸 `--line-2` 横线 |
| 底部五页导航 | `.primary-nav` `.nav-tab` `.nav-tab.active` | 顶边 1px `--ink`、底 `--paper-2`、无圆角无阴影；选中项 `--vermilion` 700 字重加底部 2px 短线 |
| 创角页 | `.start-cover` `.creation-sheet` `.opts .opt` `.field` | 左栏改 `--ink-bg` 深底、竖排书法标题；出身选项改为三列无圆角卡；输入框只留下边线 |
| 弹窗 | `.modal` `.overlay` | `--paper-2` 底、1px `--ink` 边、无圆角 |

印章式标签（「急」「推荐」「已选」「灵气 0.7」）现版没有对应组件，新建 `.seal`：1.5px `--vermilion` 边、`--vermilion` 字、12px、`.14em` 字距、600 字重。

## 5. 建议的落地方式

按现有补丁架构**追加一层**，不改旧层：

1. 新建 `tools/visual39.css`，发布副本放 `prototype/assets/visual39.css`（与 sandbox35.css 同样两份）。
2. 在 `prototype/index.html` 第 822 行 `<link rel="stylesheet" href="assets/sandbox35.css">` 之后加一行引用 `assets/visual39.css`。
3. `visual39.css` 开头 `@import` 或粘贴 `tokens.css`，然后按第 4 节的表逐项覆盖。第三十二批那层用了很多 `!important`，覆盖同一属性时也要加 `!important`，否则不生效。
4. 底图 `body::before` 的 `opacity` 降到 `.08`。
5. 不动任何 `.js`，不动 `G` 对象，不动存档。

验收：改完后用现有脚本 `node tools/shop38-check.cjs` 等四套跑一遍，确认 121 项仍过；再按 `.screenshots/batch38/` 的两张图同场景截桌面和手机各一张，与本文件夹的 PNG 并排对比。

## 6. 给模型的提示词模板

在新会话里可以直接这样说：

> 读 `design/README.md` 和 `design/tokens.css`，看 `design/01_桌面_场景页.png` 和 `design/03_手机_场景页.png`。按 README 第 4 节的对照表和第 5 节的步骤，新建 `tools/visual39.css` 和 `prototype/assets/visual39.css`，在 index.html 里引用。只改样式，不碰任何 JS 和存档。改完跑 `node tools/shop38-check.cjs`、`local37-check.cjs`、`world36-check.cjs`、`world36-regression.cjs` 确认 121 项通过，然后截桌面和手机场景页各一张，与 design 里的 PNG 对比。

## 7. 没有做的

- 修行、行囊、家园、人物四页没有画，按同一套规则推即可。
- 山河图册页没有画，建议只换边框与文字色，地图本身不动。
- 创角页的「模式」区是 07 方案的示意，代码里没有这个功能，做皮肤时可以先不管。
