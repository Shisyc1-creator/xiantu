# 雇员详情 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让玩家查看既有人手的年龄、薪俸和工作状态。
**Architecture:** 扩展renderStaff现有选中卡片，不另存副本。出生日期取人物库，旧档回退born；未知显示未核定。
**Tech Stack:** 原生JavaScript、既有Node检查、Playwright Chromium。
**Spec:** docs/superpowers/specs/2026-10-24-staff-details-design.md

## Global Constraints

沿用全部既有数值和存档结构；不新增契约规则；不访问正常玩家存档。

## Review Focus

人物出生日期与旧born不同、缺失日期、发薪已到期、欠薪、详情反复打开不推进时间或资源；由下方场景覆盖。浏览器另看窄屏可达与横向溢出。

## Task 1: 既有人手详情

Files: tools/sandbox35.js及prototype/assets/sandbox35.js；tools/staff53-check.cjs；tools/staff53-browser-check.cjs。
Interface: renderStaff()消费现有worker/person数据，返回HTML；现有selectWorker派发入口不变。

- [x] 在既有逻辑检查增加人物日期优先、旧档缺失、欠薪与到期文字、反复查看无时间/资源变化的断言；运行确认旧版缺少详情。
- [x] 实现小型只读详情格式函数并接入现有卡片，同步发布副本。
- [x] 运行node --test tools/staff53-check.cjs，语法和副本一致检查。
- [x] 扩充既有浏览器检查中的详情断言，验证桌面与手机尺寸的实际界面及保存重载。
- [x] 提交独立开发分支，记录实际检查结果和仍未实现内容。

验证：13项逻辑及16项真实浏览器检查通过（890720b，运行39996582262）。独立复核1项Important已通过真实缺失字段RED→GREEN修复：原同步误删缺出生记录雇员。没有剩余Minor。

Ruling: 人物库缺出生日期时优先回收雇员原保存日期；双方均未知时保留未知、不自动宣判寿尽，明确死亡仍保留。若将未知误当已知会丢失人物，本方案避免该损失；未知记录仍需后续资料恢复。新机制数值、真机和长期平衡暂不判断，不宣称已完成。
