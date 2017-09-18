# postcss-pxconverter

## 目前存在的问题

1. rem 布局受到 root font-size 影响，如果 Android 开启了字号放大模式，会导致整个布局崩盘。
2. Android 下 viewport scale 强制为 1，一些 Canvas 绘制的内容略为模糊。部分 Android 设备改变 scale 有 bug，机型太多较难定位。

## 改进的思路

1. 保留原本 rem 方案的基础上，对于非 font-size 的单位渐进增强，在 `rem` 的规则下面新增一条 `vw` 的规则进行覆盖。此方案可以保证低版本 Android 的兼容问题，也可以避免修改 DPR 导致的不可控后果。
2. （尝试）建立一个 Android UA 白名单，在白名单内的设备允许开启高 DPR 模式。

## 可能的缺陷

1. CSS 体积增加。
