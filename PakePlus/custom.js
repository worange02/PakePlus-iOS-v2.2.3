window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// ==UserScript==
// @name         PakePlus - 汉堡阅读器
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  强制修改页面文字，为 PakePlus 环境优化
// @author       You
// @include      *
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    console.log('[汉堡脚本] 已启动 (为 PakePlus 优化)');

    // 用于隐藏 GitHub 按钮的 CSS（这种方式最稳定，不会被框架覆盖）
    const hideGithubStyle = `
        .github-corner,
        a[href*="github.com/hectorqin"],
        a[href*="github"] {
            display: none !important;
            visibility: hidden !important;
            width: 0 !important;
            height: 0 !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
    `;

    // 执行样式的注入
    function injectStyle() {
        if (!document.getElementById('pakeplus-hamburger-style')) {
            const style = document.createElement('style');
            style.id = 'pakeplus-hamburger-style';
            style.textContent = hideGithubStyle;
            document.head.appendChild(style);
            console.log('[汉堡脚本] CSS 样式已注入');
        }
    }

    // 执行文字替换的核心函数（使用 TreeWalker，比 innerHTML 更安全可靠）
    function replaceTextNodes() {
        if (!document.body) return false;
        
        let modified = false;
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // 跳过 script 和 style 标签内的文本
                    if (node.parentElement && 
                        (node.parentElement.tagName === 'SCRIPT' || 
                         node.parentElement.tagName === 'STYLE')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const nodesToModify = [];
        while (walker.nextNode()) {
            nodesToModify.push(walker.currentNode);
        }

        nodesToModify.forEach(node => {
            let text = node.nodeValue;
            if (!text) return;
            
            let newText = text;
            if (text.includes('阅读')) {
                newText = newText.replace(/阅读/g, '汉堡');
                modified = true;
            }
            if (text.includes('v3.2.14-05250935')) {
                newText = newText.replace(/v3\.2\.14-05250935/g, 'v1.0');
                modified = true;
            }
            if (text.includes('清风不识字，何故乱翻书')) {
                newText = newText.replace(/清风不识字，何故乱翻书/g, '层层叠起的微型宇宙');
                modified = true;
            }
            
            if (newText !== text) {
                node.nodeValue = newText;
            }
        });
        
        if (modified) {
            console.log('[汉堡脚本] 文本节点已更新');
        }
        return modified;
    }

    // 主函数，整合样式注入和文本替换
    function main() {
        // 只要 head 存在就注入样式
        if (document.head) {
            injectStyle();
        } else {
            // 如果 head 还不存在，稍后重试
            setTimeout(injectStyle, 10);
        }
        
        // 替换文本
        const textModified = replaceTextNodes();
        
        // 如果还没修改过，或者看起来 body 内容还不完整，就继续重试
        if (!textModified || document.body?.innerText.length < 100) {
            setTimeout(main, 500);
        }
    }

    // 监听页面开始
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
        // 对于极快的页面，也尝试立即执行一次
        setTimeout(main, 0);
    } else {
        main();
    }
    
    // 持续监听 DOM 变化，应对 Vue/React 的动态更新
    let observer = null;
    function startObserver() {
        if (document.body) {
            if (observer) observer.disconnect();
            observer = new MutationObserver(() => {
                injectStyle();
                replaceTextNodes();
            });
            observer.observe(document.body, { childList: true, subtree: true, characterData: true });
            console.log('[汉堡脚本] 已开始监听 DOM 变化');
        } else {
            setTimeout(startObserver, 100);
        }
    }
    startObserver();
    
    // 每隔 3 秒强制检查一次，作为最终保险
    setInterval(() => {
        injectStyle();
        replaceTextNodes();
    }, 3000);

})();