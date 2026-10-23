# Review Bundle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 生成含美术和版本校验清单的完整试玩审阅包。
**Architecture:** Python标准库读取git跟踪的prototype列表，先核对静态依赖，再ZIP并附清单；现有CI上传附件。
**Tech Stack:** Python3、zipfile/hashlib/HTMLParser、既有GitHub Actions。
**Spec:** docs/superpowers/specs/2026-10-24-review-bundle-design.md

## Global Constraints

不发布站点、不上传存档；原入口和存档键不变；仅打包prototype跟踪文件。

## Review Focus

缺图、CSS相对路径、路径逃逸、符号链接、工作区额外私有文件，均用临时文件夹测试；动态字符串不作全覆盖承诺。

## Task 1: 构建与资源审计

Files: tools/build-review-bundle.py、tools/test_review_bundle.py、.github/workflows/staff-browser.yml、设定与设计/14_发布与回滚准备.md。
Interfaces: build_bundle(root:Path, files:list[str], commit:str, output:Path)->dict生成ZIP并返回manifest；CLI从git ls-files取files。

- [x] 写临时文件夹测试：完整资源及哈希、缺失脚本/图片、CSS相对图、目录逃逸、链接逃逸、未跟踪私有文件不入包；运行确认构建器尚不存在。
- [x] 用标准库实现构建器，静态资源失败返回非零，不覆盖已有输出。
- [x] 运行python -m unittest discover -s tools -p test_review_bundle.py -v及原人手逻辑检查。
- [x] 现有CI加入构建器测试、完整仓库构建、附件；只保留PR/手动触发，避免同一提交push和PR重复运行。
- [ ] 检查真实CI附件文件清单与hash，并记录未发布、真机和存档回滚限制。

独立复核：3项Important（未跟踪符号链接别名放行、音频等src漏查、CSS URL大小写漏查）均有真实临时目录用例RED→GREEN修复，10项测试通过。无剩余Minor。

Ruling: 静态资源检查仅覆盖已声明的HTML src/href/poster/object data、HTML/CSS url和现有图册字面量，不把任意JS动态拼接/完整浏览器资源语义视作已验证；漏网动态资源仍由真实运行与后续测试承担。当前五张美术以真实CI归档回读为准；不把本机缺图快照当完整发行包。
