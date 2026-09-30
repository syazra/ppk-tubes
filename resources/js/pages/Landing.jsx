import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import heroBackground from '../../images/landing-botanical.webp';
import oggRegular from '../../fonts/ogg-regular.otf';
import oggItalic from '../../fonts/ogg-regular-italic.otf';

const styles = `
@font-face { font-family: 'CampuSpace Ogg'; src: url('${oggRegular}') format('opentype'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'CampuSpace Ogg'; src: url('${oggItalic}') format('opentype'); font-weight: 400; font-style: italic; font-display: swap; }
.cs {
    --forest: #003b33; --deep: #062e29; --teal: #007f6d;
    --lime: #d3e9a6; --paper: #f8f9f3; --ink: #163f35; --muted: #5b6e62;
    background: var(--paper); color: var(--ink);
    font-family: Figtree, ui-sans-serif, system-ui, sans-serif; line-height: 1.6; overflow: clip;
}
.cs * { box-sizing: border-box; }
.cs a { color: inherit; text-decoration: none; }
.cs button { font: inherit; }
.cs svg { display: block; }
.cs h1, .cs h2, .cs h3, .cs p, .cs figure { margin: 0; }
.cs ::selection { background: var(--lime); color: var(--forest); }
.cs :focus-visible { outline: 3px solid var(--teal); outline-offset: 5px; }
.cs .cs-dark :focus-visible, .cs-nav :focus-visible { outline-color: var(--lime); }
.cs .cs-reservation-preview :focus-visible { outline-color: var(--teal); }
.cs-wrap { width: min(1240px, calc(100% - 96px)); margin-inline: auto; }
.cs-serif { font-family: 'CampuSpace Ogg', Georgia, 'Times New Roman', serif; font-weight: 400; letter-spacing: -.035em; }
.cs-section { padding-block: 100px; scroll-margin-top: 104px; }
.cs-section-title { font-size: clamp(36px, 3.8vw, 52px); line-height: 1.2; }
.cs-eyebrow { display: flex; align-items: center; gap: 10px; margin-bottom: 20px !important; color: var(--teal); font-size: 11px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; }
.cs-eyebrow:before { content: ''; width: 24px; height: 1px; background: currentColor; }
.cs-reveal { transition: opacity .65s ease, translate .65s cubic-bezier(.22, 1, .36, 1); transition-delay: var(--reveal-delay, 0ms); }
.cs-reveal[data-reveal="pending"] { opacity: 0; translate: 0 20px; transition: none; }
.cs-reveal[data-reveal="visible"] { opacity: 1; translate: 0 0; transition-delay: var(--reveal-delay, 0ms); }
.cs-copy { color: var(--muted); font-size: 16px; line-height: 1.8; }
.cs-icon { width: 24px; height: 24px; flex: none; }
.cs-arrow { width: 18px; height: 18px; }
.cs-button { display: inline-flex; align-items: center; justify-content: center; gap: 20px; min-height: 50px; padding: 13px 24px; border: 1px solid transparent; border-radius: 8px; font-size: 14px; font-weight: 600; transition: background .2s, box-shadow .2s, transform .2s; }
.cs-button-primary { background: var(--lime); color: var(--forest) !important; }
.cs-button-primary:hover { background: #e2f2c1; box-shadow: 0 5px 18px #001e231a; transform: translateY(-2px); }
.cs-button-secondary { background: #ffffff05; border-color: #ffffff35; color: var(--paper); }
.cs-button-secondary:hover { background: #ffffff12; border-color: #ffffff60; }
.cs-button .cs-arrow, .cs-feature-link .cs-arrow, .cs-preview-link .cs-arrow { transition: transform .2s ease; }
.cs-button:hover .cs-arrow, .cs-feature-link:hover .cs-arrow, .cs-preview-link:hover .cs-arrow { transform: translateX(3px); }
.cs-button-secondary:hover .cs-arrow { transform: translateY(3px); }
.cs-button:active { transform: translateY(0); }
.cs-skip { position: fixed; top: 8px; left: 12px; z-index: 100; padding: 12px 20px; background: var(--lime); transform: translateY(-160%); }
.cs-skip:focus { transform: none; }
.cs main { scroll-margin-top: 82px; }
.cs-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 30; background: linear-gradient(90deg, #00A991, #11695D); color: var(--paper); border-bottom: 1px solid #ffffff1a; box-shadow: 0 4px 24px #001e2310; transition: box-shadow .25s ease; }
.cs-nav[data-scrolled="true"] { box-shadow: 0 8px 30px #003b3326; }
.cs-reading-progress { position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: var(--lime); transform: scaleX(0); transform-origin: left; pointer-events: none; }
.cs-nav-inner { height: 82px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.cs-brand { display: inline-flex; align-items: center; gap: 10px; white-space: nowrap; font-size: 23px; font-weight: 600; letter-spacing: -.8px; }
.cs-brand-mark { width: 32px; height: 32px; flex: none; color: var(--lime); }
.cs-brand span span { font-weight: 400; }
.cs-brand-mark { transition: transform .25s ease; }
.cs-brand:hover .cs-brand-mark { transform: rotate(-6deg); }
.cs-nav-links { display: flex; align-items: center; gap: 36px; font-size: 13px; color: #e3eae1; }
.cs-nav-links a { position: relative; padding-block: 10px; transition: color .2s; }
.cs-nav-links a:after { content: ''; position: absolute; left: 0; right: 0; bottom: 3px; height: 1px; background: var(--lime); transform: scaleX(0); transform-origin: left; transition: transform .25s ease; }
.cs-nav-links a[aria-current="location"], .cs-mobile-nav a[aria-current="location"] { color: var(--lime); }
.cs-nav-links a[aria-current="location"]:after, .cs-nav-links a:hover:after { transform: scaleX(1); }
.cs-nav-links a:hover { color: var(--lime); }
.cs-nav-action { display: flex; align-items: center; gap: 12px; }
.cs-nav .cs-button { min-height: 44px; padding: 10px 20px; font-size: 13px; }
.cs-menu-toggle { display: none; width: 44px; height: 44px; border: 1px solid #ffffff30; border-radius: 8px; background: #ffffff05; color: inherit; align-items: center; justify-content: center; }
.cs-mobile-nav, .cs-mobile-nav[hidden] { display: none; }
.cs-mobile-nav:not([hidden]) { animation: cs-menu-in .2s ease-out; }
.cs-hero { position: relative; background: linear-gradient(90deg, #073c3594, #073c3538 70%), url('${heroBackground}') center / cover no-repeat; color: var(--paper); overflow: hidden; }
.cs-hero:before { content: ''; position: absolute; inset: 0; background: linear-gradient(120deg, #ffffff0d, #d8ece306 55%, #073c3514); pointer-events: none; }
.cs-hero:after { content: ''; position: absolute; inset: auto 0 0; height: 120px; background: linear-gradient(transparent, #073c3538); pointer-events: none; }
.cs-hero-grid { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1.04fr; align-items: center; gap: 64px; padding-block: 164px 90px; min-height: 770px; }
.cs-hero .cs-eyebrow { color: #e3efcf; margin-bottom: 27px !important; }
.cs-hero-content > * { animation: cs-arrive .75s cubic-bezier(.22, 1, .36, 1) both; }
.cs-hero-content > :nth-child(2) { animation-delay: .06s; }
.cs-hero-content > :nth-child(3) { animation-delay: .12s; }
.cs-hero-content > :nth-child(4) { animation-delay: .18s; }
.cs-hero-content > :nth-child(5) { animation-delay: .24s; }
.cs-hero h1 { font-size: clamp(60px, 6.3vw, 86px); line-height: 1.08; margin-bottom: 28px; text-shadow: 0 2px 24px #00362d20; }
.cs-hero h1 em { color: #d6ebb4; font-weight: 400; }
.cs-hero-copy { max-width: 405px; color: #edf2e8; font-size: 16px; line-height: 1.85; }
.cs-hero-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 32px; }
.cs-hero-note { display: flex; align-items: center; gap: 7px; margin-top: 22px !important; color: #e0e9dc; font-size: 12px; }
.cs-hero-note svg { width: 14px; height: 14px; }
.cs-art { position: relative; min-width: 0; animation: cs-arrive .9s .18s cubic-bezier(.22, 1, .36, 1) both; }
.cs-reservation-preview { position: relative; width: 100%; background: #f7fbef; color: var(--ink); border: 1px solid #d5e1cc; border-radius: 16px; overflow: hidden; box-shadow: 0 24px 64px #002c3045; }
.cs-preview-bar { display: flex; align-items: center; gap: 14px; padding: 16px 24px; background: #edf3e6; border-bottom: 1px solid #dce5d5; font-size: 10px; letter-spacing: .04em; color: #52664e; }
.cs-preview-dots { display: flex; gap: 5px; }
.cs-preview-dots i { width: 6px; height: 6px; background: #b8cbb0; border-radius: 50%; }
.cs-preview-dots i:first-child { background: #00a991; }
.cs-preview-body { padding: 26px; }
.cs-preview-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 25px; }
.cs-preview-heading h2 { font-family: Inter, Figtree, ui-sans-serif, system-ui, sans-serif; font-size: 19px; font-weight: 700; letter-spacing: -.02em; }
.cs-preview-heading p { font-size: 11px; color: var(--teal); margin-top: 4px; }
.cs-preview-toolbar { display: flex; justify-content: flex-end; padding: 13px; margin-bottom: 16px; background: #fff; border: 1px solid #e7f3ce; border-radius: 8px; box-shadow: 0 1px 2px #003b3305; }
.cs-preview-create { display: inline-flex; align-items: center; min-height: 44px; flex: none; padding: 9px 14px; background: #00a991; color: #fff !important; border-radius: 7px; font-size: 11px; font-weight: 500; transition: background .2s; }
.cs-preview-create:hover { background: #009883; }
.cs-preview-table-wrap { overflow: hidden; background: #fff; border: 1px solid #e7f3ce; border-radius: 8px; box-shadow: 0 1px 2px #003b3305; }
.cs-preview-table { width: 100%; table-layout: fixed; border-collapse: collapse; text-align: left; }
.cs-preview-table th { padding: 12px 8px; background: #f0fdfa; color: #0f766e; font-size: 9px; font-weight: 600; letter-spacing: .025em; line-height: 1.5; text-transform: uppercase; }
.cs-preview-table th:nth-last-child(-n+2) { width: 14%; }
.cs-preview-table td { padding: 40px 6px; color: #66756c; font-size: 11px; text-align: center; }
.cs-preview-link { display: inline-flex; align-items: center; min-height: 44px; gap: 8px; margin-top: 10px; font-size: 11px; color: var(--teal) !important; }
.cs-preview-link:hover { text-decoration: underline; }
.cs-preview-link svg { width: 13px; height: 13px; }
@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .cs-nav { background: linear-gradient(90deg, #00A991cc, #11695Dcc); -webkit-backdrop-filter: blur(20px) saturate(125%); backdrop-filter: blur(20px) saturate(125%); }
    .cs-hero:before { -webkit-backdrop-filter: blur(6px) saturate(115%); backdrop-filter: blur(6px) saturate(115%); }
}
.cs-heading-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 60px; margin-bottom: 32px; }
.cs-heading-row .cs-copy { max-width: 400px; }
.cs-facilities { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 32px; }
.cs-facility { display: flex; align-items: center; gap: 9px; padding: 9px 15px; background: #edf1e5; border: 1px solid #dde5d6; border-radius: 30px; font-size: 12px; color: #47604c; transition: background .2s, border-color .2s; }
.cs-facility svg { width: 18px; height: 18px; }
.cs-feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.cs-feature { display: flex; flex-direction: column; align-items: flex-start; padding: 32px; background: #ffffff90; border: 1px solid #dfe6d8; border-radius: 16px; transition: opacity .65s ease, translate .65s cubic-bezier(.22, 1, .36, 1), transform .25s ease, border-color .25s, box-shadow .25s; }
.cs-feature > .cs-icon { box-sizing: content-box; padding: 12px; color: var(--teal); background: #eaf1e3; border-radius: 12px; margin-bottom: 24px; transition: transform .25s ease, background .25s; }
.cs-feature h3 { font-size: 23px; font-weight: 600; letter-spacing: -.5px; margin-bottom: 12px; }
.cs-feature p { font-size: 15px; color: var(--muted); line-height: 1.8; max-width: 480px; }
.cs-feature-link { display: inline-flex; align-items: center; gap: 10px; min-height: 44px; margin-top: auto; padding-top: 22px; color: var(--teal) !important; font-size: 13px; font-weight: 600; text-underline-offset: 4px; }
.cs-feature-link:hover { text-decoration: underline; }
.cs-journey { background: #edf1e6; border-block: 1px solid #dfe6d7; }
.cs-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px; margin-top: 38px; padding: 0; list-style: none; }
.cs-step { padding-top: 24px; border-top: 1px solid #bccdb4; transition: opacity .65s ease, translate .65s cubic-bezier(.22, 1, .36, 1), border-color .25s; }
.cs-step-number { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border: 1px solid #c4d2bb; border-radius: 50%; color: var(--teal); font-size: 12px; margin-bottom: 22px; transition: background .25s, border-color .25s; }
.cs-step h3 { font-size: 19px; font-weight: 600; letter-spacing: -.3px; margin-bottom: 12px; }
.cs-step p { font-size: 14px; line-height: 1.8; color: var(--muted); }
.cs-roles { display: grid; grid-template-columns: .85fr 1.15fr; gap: 80px; }
.cs-role { display: grid; grid-template-columns: 200px 1fr; gap: 22px; padding-block: 23px; border-top: 1px solid #cbd7c2; }
.cs-role h3 { font-size: 15px; font-weight: 600; }
.cs-role-title { display: flex; align-items: center; gap: 10px; }
.cs-role-icon { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; flex: none; background: #edf1e5; border-radius: 9px; color: var(--teal); }
.cs-role-icon svg { width: 18px; height: 18px; }
.cs-role p { color: var(--muted); font-size: 14px; line-height: 1.8; }
.cs-faq { border-top: 1px solid #dbe1d3; }
.cs-faq-grid { display: grid; grid-template-columns: .8fr 1.2fr; gap: 80px; }
.cs-faq-intro .cs-copy { max-width: 300px; margin-top: 20px; }
.cs-faq-list { border-top: 1px solid #cdd8c6; }
.cs-faq details { border-bottom: 1px solid #cdd8c6; transition: opacity .65s ease, translate .65s cubic-bezier(.22, 1, .36, 1), border-color .25s; }
.cs-faq details[open] { border-bottom-color: #007f6d80; }
.cs-faq summary { list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 24px; cursor: pointer; padding: 22px 0; font-size: 14px; font-weight: 600; min-height: 66px; }
.cs-faq summary::-webkit-details-marker { display: none; }
.cs-faq-indicator { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; flex: none; border: 1px solid #d8e1cf; border-radius: 50%; color: #5b7950; transition: transform .25s, background .25s, border-color .25s; }
.cs-faq-indicator svg { width: 14px; height: 14px; }
.cs-faq details[open] .cs-faq-indicator { transform: rotate(180deg); background: #eaf1e3; border-color: #b8cbb0; }
.cs-faq details[open] summary { color: var(--teal); }
.cs-faq summary:hover { color: var(--teal); }
.cs-faq details p { font-size: 14px; line-height: 1.85; color: var(--muted); padding: 0 24px 24px 0; }
.cs-faq details[open] p { animation: cs-answer-in .25s ease-out; }
.cs-final { background: radial-gradient(ellipse at 85% 100%, #24594b70, transparent 65%), var(--deep); color: var(--paper); padding-block: 80px; }
.cs-final .cs-wrap { display: flex; justify-content: space-between; align-items: center; gap: 35px; }
.cs-final h2 { font-size: clamp(34px, 3.7vw, 48px); line-height: 1.2; margin-bottom: 16px; max-width: 670px; }
.cs-final p { font-size: 14px; color: #bdcec3; }
.cs-final .cs-button { flex: none; }
.cs-footer { background: var(--deep); color: #b0c2b4; }
.cs-footer-inner { padding-block: 28px; border-top: 1px solid #ffffff20; display: flex; justify-content: space-between; gap: 25px; align-items: center; }
.cs-footer .cs-brand { font-size: 19px; color: var(--paper); }
.cs-footer .cs-brand-mark { width: 26px; height: 26px; }
.cs-footer p { font-size: 12px; }
.cs-footer-links { display: flex; gap: 22px; font-size: 12px; }
.cs-footer-links a:hover { color: var(--lime); }
.cs-back-top { position: fixed; right: 24px; bottom: 24px; z-index: 20; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border: 1px solid #ffffff26; border-radius: 50%; background: var(--forest); color: var(--lime) !important; box-shadow: 0 5px 20px #003b3326; opacity: 0; visibility: hidden; pointer-events: none; transform: translateY(12px); transition: opacity .2s, visibility .2s, transform .2s, background .2s; }
.cs[data-past-hero="true"] .cs-back-top { opacity: 1; visibility: visible; pointer-events: auto; transform: translateY(0); }
.cs-back-top:hover { background: var(--teal); }
.cs-back-top .cs-arrow { transform: rotate(180deg); }
@keyframes cs-arrive { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
@keyframes cs-answer-in { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
@keyframes cs-menu-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
@media (hover: hover) and (pointer: fine) {
    .cs-feature:hover, .cs-feature:focus-within { transform: translateY(-4px); border-color: #a7c7b2; box-shadow: 0 12px 32px #163f350b; }
    .cs-feature:hover > .cs-icon, .cs-feature:focus-within > .cs-icon { transform: rotate(-5deg); background: #e0eed3; }
    .cs-facility:hover { background: #e4edda; border-color: #c4d5b8; }
    .cs-step:hover { border-top-color: var(--teal); }
    .cs-step:hover .cs-step-number { background: #e0eed3; border-color: #adc59b; }
}
@media (max-width: 1050px) {
    .cs-wrap { width: calc(100% - 64px); }
    .cs-nav-links { gap: 20px; }
    .cs-hero-grid { gap: 32px; min-height: 720px; }
    .cs-hero h1 { font-size: 62px; }
    .cs-preview-heading { flex-wrap: wrap; }
    .cs-preview-body { padding: 20px; }
    .cs-heading-row { gap: 35px; }
    .cs-roles, .cs-faq-grid { gap: 45px; }
    .cs-role { grid-template-columns: 1fr; gap: 9px; }
}
@media (max-width: 900px) {
    .cs-wrap { width: calc(100% - 40px); }
    .cs-section { padding-block: 64px; scroll-margin-top: 92px; }
    .cs-nav-inner { height: 70px; gap: 12px; }
    .cs-brand { font-size: 21px; }
    .cs-brand-mark { width: 29px; height: 29px; }
    .cs-nav-links { display: none; }
    .cs-nav .cs-button { padding: 10px 14px; }
    .cs-nav .cs-button svg { display: none; }
    .cs-menu-toggle { display: flex; }
    .cs-mobile-nav { display: flex; flex-direction: column; border-top: 1px solid #ffffff20; padding: 10px 20px 18px; }
    .cs-mobile-nav a { padding: 12px 0; font-size: 14px; }
    .cs-hero { background-position: center, 45% center; }
    .cs-hero-grid { grid-template-columns: 1fr; padding-block: 124px 56px; gap: 42px; }
    .cs-hero .cs-eyebrow { margin-bottom: 22px !important; }
    .cs-hero h1 { font-size: clamp(49px, 10.5vw, 76px); margin-bottom: 24px; }
    .cs-hero-copy { max-width: 480px; }
    .cs-hero-actions { gap: 10px; }
    .cs-hero-actions .cs-button { padding-inline: 18px; gap: 12px; font-size: 13px; }
    .cs-art { width: min(490px, 100%); margin-inline: auto; }
    .cs-preview-heading { flex-wrap: nowrap; }
    .cs-preview-heading h2 { font-size: 16px; }
    .cs-preview-bar { padding-inline: 20px; }
    .cs-preview-create { font-size: 10px; padding: 9px; }
    .cs-preview-table th { font-size: 8px; padding-inline: 4px; }
    .cs-heading-row { display: block; margin-bottom: 28px; }
    .cs-heading-row .cs-copy { margin-top: 20px; max-width: 480px; }
    .cs-feature-grid, .cs-steps, .cs-roles, .cs-faq-grid { grid-template-columns: 1fr; gap: 28px; }
    .cs-feature { padding: 26px; }
    .cs-facilities { gap: 8px; }
    .cs-facility { font-size: 12px; }
    .cs-steps { margin-top: 30px; }
    .cs-step { padding: 24px 0 0 54px; position: relative; }
    .cs-step-number { position: absolute; top: 24px; left: 0; }
    .cs-role { grid-template-columns: 1fr; gap: 10px; }
    .cs-final .cs-wrap { align-items: flex-start; flex-direction: column; gap: 24px; }
    .cs-footer-inner { flex-wrap: wrap; }
    .cs-footer p { order: 3; width: 100%; }
    .cs-footer-links { gap: 17px; }
    .cs-back-top { right: 16px; bottom: 18px; }
}
@media (max-width: 380px) {
    .cs-brand { font-size: 18px; gap: 6px; }
    .cs-brand-mark { width: 26px; }
    .cs-nav-action { gap: 7px; }
    .cs-nav .cs-button { padding-inline: 11px; font-size: 12px; }
    .cs-hero h1 { font-size: clamp(40px, 13vw, 47px); }
    .cs-hero-actions .cs-button { padding-inline: 14px; font-size: 12px; }
    .cs-preview-heading { flex-wrap: wrap; gap: 10px; }
    .cs-preview-heading p { max-width: none; }
    .cs-preview-body { padding: 16px; }
    .cs-preview-table th { padding-inline: 3px; text-transform: none; overflow-wrap: anywhere; }
}
@media (prefers-reduced-motion: reduce) {
    .cs *, .cs *:before, .cs *:after { animation: none !important; transition: none !important; }
    .cs-reveal[data-reveal="pending"] { opacity: 1; translate: none; }
    .cs-feature:hover, .cs-feature:focus-within, .cs-feature:hover > .cs-icon, .cs-feature:focus-within > .cs-icon, .cs-button:hover, .cs-button:hover .cs-arrow, .cs-feature-link:hover .cs-arrow, .cs-preview-link:hover .cs-arrow, .cs-brand:hover .cs-brand-mark { transform: none; }
}
@media (forced-colors: active) {
    .cs-button, .cs-reservation-preview, .cs-nav, .cs-facility, .cs-feature { border: 1px solid ButtonText; }
    .cs-nav, .cs-reservation-preview { background: Canvas; color: CanvasText; }
    .cs-hero { background: Canvas; color: CanvasText; }
}
`;

function Icon({ name, className = 'cs-icon' }) {
    const paths = {
        arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
        down: <path d="M12 4v16m-5-5 5 5 5-5" />,
        check: <path d="m5 12 4 4L19 6" />,
        room: <path d="M4 21h16M6 21V4l12-2v19M10 21v-7h4v7M9 7h1m4-1h1M9 10h1m4-1h1" />,
        calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4m10-4v4M3 11h18m-13 5 3 3 5-5" /></>,
        leaf: <path d="M20 3C9 1 2 6 4 14s17 7 16-11ZM4 21 16 8M9 16l-1-5m5 1 5-1" />,
        grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
        lab: <path d="M8 3h8m-6 0v7L4 19a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2l-6-9V3M7 15h10" />,
        hall: <path d="m2 9 10-6 10 6H2Zm2 12h16M6 9v12m6-12v12m6-12v12" />,
        field: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M12 5v14M2 9h3v6H2m20-6h-3v6h3" /><circle cx="12" cy="12" r="3" /></>,
        tool: <><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M8 21h8m-4-4v4M7 9h4" /></>,
        people: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 6" /></>,
        shield: <><path d="m12 2 8 3v6c0 5-8 11-8 11S4 16 4 11V5l8-3Z" /><path d="m8 12 3 3 5-6" /></>,
        menu: <path d="M4 7h16M4 12h16M4 17h16" />,
        close: <path d="m6 6 12 12M6 18 18 6" />,
        chevron: <path d="m6 9 6 6 6-6" />,
    };
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.leaf}</svg>;
}

function Brand() {
    // Heroicons 24/outline/academic-cap, from the installed heroicons package.
    return <><svg className="cs-brand-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg><span>Campu<span>Space</span></span></>;
}

// Mirrors the title, separate action card, table, and default empty state in
// origin/feat/user/reserve (8129427): resources/views/user/my-reservations.blade.php.
function ReservationPreview({ reservationUrl, createReservationUrl }) {
    return (
        <figure className="cs-reservation-preview">
            <figcaption className="cs-preview-bar"><span className="cs-preview-dots" aria-hidden="true"><i /><i /><i /></span>Pratinjau halaman reservasi</figcaption>
            <div className="cs-preview-body">
                <div className="cs-preview-heading">
                    <div><h2>Reservasi Saya</h2><p>Lihat daftar fasilitas yang pernah kamu pinjam.</p></div>
                </div>
                <div className="cs-preview-toolbar">
                    <a className="cs-preview-create" href={createReservationUrl}>+ Tambah Reservasi</a>
                </div>
                <div className="cs-preview-table-wrap">
                <table className="cs-preview-table" aria-label="Pratinjau daftar reservasi tanpa data akun">
                    <thead><tr>
                        <th scope="col">Nama fasilitas</th>
                        <th scope="col">Tanggal & waktu</th>
                        <th scope="col">Tujuan penggunaan</th>
                        <th scope="col">Status</th>
                        <th scope="col">Aksi</th>
                    </tr></thead>
                    <tbody><tr><td colSpan={5}>Belum ada reservasi</td></tr></tbody>
                </table>
                </div>
                <a className="cs-preview-link" href={reservationUrl}>Buka Reservasi Saya <Icon name="arrow" className="cs-arrow" /></a>
            </div>
        </figure>
    );
}

const facilities = [['room', 'Ruang kelas'], ['hall', 'Aula'], ['lab', 'Laboratorium'], ['tool', 'Peralatan'], ['field', 'Lapangan']];
const features = [
    { icon: 'calendar', title: 'Reservasi fasilitas', text: 'Pilih fasilitas dan tanggal, periksa jadwal yang tersedia, lalu ajukan peminjaman. Lihat status pengajuan dan tiket peminjaman di halaman Reservasi Saya.', action: 'reservation', actionLabel: 'Ajukan reservasi' },
    { icon: 'tool', title: 'Laporan kerusakan', text: 'Pilih fasilitas yang bermasalah dan jelaskan kondisinya. Laporan masuk ke petugas agar dapat diperiksa dan ditindaklanjuti.', action: 'login', actionLabel: 'Masuk untuk melapor' },
];
const steps = [
    ['Pilih fasilitas dan jadwal', 'Masuk dengan akun kampus. Pada form reservasi, pilih ruangan dan tanggal untuk melihat ketersediaan waktu.'],
    ['Lengkapi pengajuan', 'Isi tujuan penggunaan dan pilih rentang waktu yang dibutuhkan, lalu kirim pengajuan.'],
    ['Periksa status reservasi', 'Buka Reservasi Saya untuk melihat hasil peninjauan. Jika disetujui, tiket peminjaman dapat dibuka dari daftar tersebut.'],
];
const roles = [
    ['Mahasiswa & dosen', 'Mengajukan peminjaman untuk kegiatan kampus dan melaporkan masalah pada fasilitas.', 'people'],
    ['Petugas', 'Meninjau pengajuan reservasi dan menindaklanjuti laporan fasilitas.', 'shield'],
    ['Admin', 'Mengelola akses pengguna dan memantau layanan fasilitas kampus.', 'grid'],
];
const faqs = [
    ['Bagaimana cara mendapatkan akun?', 'Gunakan akun yang diberikan pengelola kampus. Jika belum memiliki akun atau mengalami kendala saat masuk, hubungi petugas atau admin kampus.'],
    ['Fasilitas apa saja yang bisa dipinjam?', 'Fasilitas mengikuti daftar yang disediakan pengelola kampus. CampuSpace ditujukan untuk mengelola ruang kelas, aula, laboratorium, peralatan, dan lapangan.'],
    ['Apakah reservasi langsung disetujui?', 'Pengajuan perlu ditinjau oleh petugas atau admin. Periksa statusnya di Reservasi Saya dan pastikan sudah disetujui sebelum menggunakan fasilitas.'],
    ['Bisakah reservasi dibatalkan?', 'Reservasi yang masih berstatus Menunggu dapat dibatalkan melalui halaman Reservasi Saya. Untuk pengajuan yang sudah disetujui, hubungi petugas kampus.'],
    ['Bagaimana melaporkan fasilitas bermasalah?', 'Masuk ke akunmu dan buka layanan laporan. Pilih fasilitas yang bermasalah, lalu jelaskan kerusakan atau kendalanya agar petugas dapat menindaklanjuti.'],
];

export default function Landing({ loginUrl, reservationUrl, createReservationUrl }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const rootRef = useRef(null);
    const navRef = useRef(null);
    const progressRef = useRef(null);

    useEffect(() => {
        const previousLanguage = document.documentElement.lang;
        document.documentElement.lang = 'id';
        return () => { document.documentElement.lang = previousLanguage; };
    }, []);

    useEffect(() => {
        const root = rootRef.current;
        const nav = navRef.current;
        const hero = root.querySelector('.cs-hero');
        const sections = [...root.querySelectorAll('#fasilitas, #cara-kerja, #faq')];
        const revealElements = [...root.querySelectorAll('.cs-reveal')];
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const desktop = window.matchMedia('(min-width: 901px)');
        const previousScrollBehavior = document.documentElement.style.scrollBehavior;
        let observer;
        let frame = null;
        let anchorFrame = null;

        const showElement = element => {
            element.dataset.reveal = 'visible';
            observer?.unobserve(element);
        };
        const updateMotionPreference = () => {
            document.documentElement.style.scrollBehavior = reducedMotion.matches ? 'auto' : 'smooth';
            if (reducedMotion.matches) {
                revealElements.forEach(showElement);
                observer?.disconnect();
            }
        };
        updateMotionPreference();

        if (!reducedMotion.matches && 'IntersectionObserver' in window) {
            observer = new IntersectionObserver(entries => {
                entries.forEach(entry => { if (entry.isIntersecting) showElement(entry.target); });
            }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
            revealElements.forEach(element => {
                // Keep initially visible content readable, including direct section links.
                if (element.getBoundingClientRect().top < window.innerHeight - 48) {
                    showElement(element);
                } else {
                    element.dataset.reveal = 'pending';
                    observer.observe(element);
                }
            });
        }

        const revealFocusedContent = event => {
            const element = event.target.closest('.cs-reveal');
            if (element) showElement(element);
        };
        const updateScroll = () => {
            frame = null;
            const distance = document.documentElement.scrollHeight - window.innerHeight;
            const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
            progressRef.current?.style.setProperty('transform', `scaleX(${progress})`);
            nav.dataset.scrolled = String(window.scrollY > 16);
            root.dataset.pastHero = String(hero.getBoundingClientRect().bottom < nav.offsetHeight + 40);
            const offset = nav.offsetHeight + 40;
            let currentSection = '';
            sections.forEach(section => {
                if (section.getBoundingClientRect().top <= offset) currentSection = section.id;
            });
            setActiveSection(previous => previous === currentSection ? previous : currentSection);
        };
        const scheduleScrollUpdate = () => {
            if (frame === null) frame = window.requestAnimationFrame(updateScroll);
        };
        const closeDesktopMenu = () => { if (desktop.matches) setMenuOpen(false); };

        // Apply the URL fragment after Inertia restores its saved scroll position.
        const initialHash = window.location.hash;
        const initialAnchor = document.getElementById(initialHash.slice(1));
        if (initialAnchor && root.contains(initialAnchor)) {
            anchorFrame = window.requestAnimationFrame(() => {
                anchorFrame = window.requestAnimationFrame(() => {
                    anchorFrame = null;
                    if (window.location.hash !== initialHash) return;
                    document.documentElement.style.scrollBehavior = 'auto';
                    initialAnchor.scrollIntoView({ behavior: 'auto', block: 'start' });
                    updateMotionPreference();
                    scheduleScrollUpdate();
                });
            });
        }
        updateScroll();
        root.addEventListener('focusin', revealFocusedContent);
        root.addEventListener('toggle', scheduleScrollUpdate, true);
        window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
        window.addEventListener('resize', scheduleScrollUpdate);
        reducedMotion.addEventListener('change', updateMotionPreference);
        desktop.addEventListener('change', closeDesktopMenu);

        return () => {
            observer?.disconnect();
            if (frame !== null) window.cancelAnimationFrame(frame);
            if (anchorFrame !== null) window.cancelAnimationFrame(anchorFrame);
            root.removeEventListener('focusin', revealFocusedContent);
            root.removeEventListener('toggle', scheduleScrollUpdate, true);
            window.removeEventListener('scroll', scheduleScrollUpdate);
            window.removeEventListener('resize', scheduleScrollUpdate);
            reducedMotion.removeEventListener('change', updateMotionPreference);
            desktop.removeEventListener('change', closeDesktopMenu);
            document.documentElement.style.scrollBehavior = previousScrollBehavior;
        };
    }, []);

    useEffect(() => {
        if (!menuOpen) return;
        const closeOutsideMenu = event => {
            if (!navRef.current?.contains(event.target)) setMenuOpen(false);
        };
        document.addEventListener('pointerdown', closeOutsideMenu);
        return () => document.removeEventListener('pointerdown', closeOutsideMenu);
    }, [menuOpen]);

    function closeOnEscape(event) {
        if (event.key === 'Escape' && menuOpen) {
            setMenuOpen(false);
            document.getElementById('cs-menu-toggle')?.focus();
        }
    }

    const navigation = [['#fasilitas', 'Fasilitas'], ['#cara-kerja', 'Cara reservasi'], ['#faq', 'FAQ']];

    return (
        <>
            <Head title="CampuSpace — Your Campus. Your Space.">
                <meta name="description" content="Cek ketersediaan fasilitas kampus, ajukan reservasi, dan laporkan kerusakan melalui CampuSpace." />
                <meta name="theme-color" content="#062e29" />
                <meta property="og:title" content="CampuSpace — Your Campus. Your Space." />
                <meta property="og:description" content="Reservasi dan laporan fasilitas kampus untuk mahasiswa, dosen, dan pengelola." />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="id_ID" />
                <link rel="preload" href={oggRegular} as="font" type="font/otf" crossOrigin="anonymous" />
                <link rel="preload" href={heroBackground} as="image" />
            </Head>
            <style>{styles}</style>
            <div className="cs" lang="id" id="atas" ref={rootRef}>
                <a className="cs-skip" href="#konten">Langsung ke konten</a>
                <header className="cs-nav" ref={navRef} onKeyDown={closeOnEscape}>
                    <div className="cs-wrap cs-nav-inner">
                        <a href="#atas" className="cs-brand" aria-label="CampuSpace, kembali ke atas"><Brand /></a>
                        <nav className="cs-nav-links" aria-label="Navigasi utama">
                            {navigation.map(([href, label]) => <a href={href} key={href} aria-current={activeSection === href.slice(1) ? 'location' : undefined}>{label}</a>)}
                        </nav>
                        <div className="cs-nav-action">
                            <a className="cs-button cs-button-primary" href={loginUrl}>Masuk <Icon name="arrow" className="cs-arrow" /></a>
                            <button id="cs-menu-toggle" className="cs-menu-toggle" type="button" aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'} aria-expanded={menuOpen} aria-controls="cs-mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>
                                <Icon name={menuOpen ? 'close' : 'menu'} />
                            </button>
                        </div>
                    </div>
                    <nav id="cs-mobile-navigation" className="cs-mobile-nav" aria-label="Navigasi seluler" hidden={!menuOpen}>
                        {navigation.map(([href, label]) => <a href={href} key={href} aria-current={activeSection === href.slice(1) ? 'location' : undefined} onClick={() => setMenuOpen(false)}>{label}</a>)}
                    </nav>
                    <div className="cs-reading-progress" ref={progressRef} aria-hidden="true" />
                </header>

                <main id="konten" tabIndex={-1}>
                    <section className="cs-hero cs-dark" aria-labelledby="hero-title">
                        <div className="cs-wrap cs-hero-grid">
                            <div className="cs-hero-content">
                                <p className="cs-eyebrow">Ruang untuk setiap kegiatan</p>
                                <h1 id="hero-title" className="cs-serif" lang="en">Your Campus.<br /><em>Your Space.</em></h1>
                                <p className="cs-hero-copy">Cek ketersediaan fasilitas kampus, ajukan reservasi, dan laporkan kerusakan melalui CampuSpace.</p>
                                <div className="cs-hero-actions">
                                    <a href={createReservationUrl} className="cs-button cs-button-primary">Ajukan reservasi <Icon name="arrow" className="cs-arrow" /></a>
                                    <a href="#cara-kerja" className="cs-button cs-button-secondary">Cara reservasi <Icon name="down" className="cs-arrow" /></a>
                                </div>
                                <p className="cs-hero-note"><Icon name="shield" />Gunakan akun yang diberikan pengelola kampus.</p>
                            </div>
                            <div className="cs-art">
                                <ReservationPreview reservationUrl={reservationUrl} createReservationUrl={createReservationUrl} />
                            </div>
                        </div>
                    </section>

                    <section className="cs-section" id="fasilitas" aria-labelledby="features-title">
                        <div className="cs-wrap">
                            <div className="cs-heading-row cs-reveal">
                                <div><p className="cs-eyebrow">Layanan kampus</p><h2 id="features-title" className="cs-serif cs-section-title">Fasilitas kampus,<br />lebih mudah diurus.</h2></div>
                                <p className="cs-copy">Urus peminjaman dan sampaikan masalah fasilitas tanpa harus berpindah layanan.</p>
                            </div>
                            <div className="cs-facilities cs-reveal" aria-label="Jenis fasilitas">
                                {facilities.map(([icon, label]) => <span className="cs-facility" key={label}><Icon name={icon} />{label}</span>)}
                            </div>
                            <div className="cs-feature-grid">
                                {features.map((feature, index) => <article className="cs-feature cs-reveal" key={feature.title} style={{ '--reveal-delay': `${index * 90}ms` }}><Icon name={feature.icon} /><h3>{feature.title}</h3><p>{feature.text}</p><a className="cs-feature-link" href={feature.action === 'reservation' ? createReservationUrl : loginUrl}>{feature.actionLabel}<Icon name="arrow" className="cs-arrow" /></a></article>)}
                            </div>
                        </div>
                    </section>

                    <section className="cs-section cs-journey" id="cara-kerja" aria-labelledby="steps-title">
                        <div className="cs-wrap">
                            <div className="cs-reveal"><p className="cs-eyebrow">Tiga langkah sederhana</p><h2 id="steps-title" className="cs-serif cs-section-title">Cara mengajukan reservasi</h2></div>
                            <ol className="cs-steps">
                                {steps.map(([title, text], index) => <li className="cs-step cs-reveal" key={title} style={{ '--reveal-delay': `${index * 90}ms` }}><span className="cs-step-number" aria-hidden="true">0{index + 1}</span><h3>{title}</h3><p>{text}</p></li>)}
                            </ol>
                        </div>
                    </section>

                    <section className="cs-section" aria-labelledby="roles-title">
                        <div className="cs-wrap cs-roles">
                            <div className="cs-reveal"><p className="cs-eyebrow">Untuk warga kampus</p><h2 id="roles-title" className="cs-serif cs-section-title">Siapa yang<br />menggunakan CampuSpace?</h2></div>
                            <div>{roles.map(([title, text, icon], index) => <article className="cs-role cs-reveal" key={title} style={{ '--reveal-delay': `${index * 70}ms` }}><h3 className="cs-role-title"><span className="cs-role-icon"><Icon name={icon} /></span>{title}</h3><p>{text}</p></article>)}</div>
                        </div>
                    </section>

                    <section className="cs-section cs-faq" id="faq" aria-labelledby="faq-title">
                        <div className="cs-wrap cs-faq-grid">
                            <div className="cs-faq-intro cs-reveal"><p className="cs-eyebrow">Ada pertanyaan?</p><h2 id="faq-title" className="cs-serif cs-section-title">Pertanyaan umum</h2><p className="cs-copy">Tentang akun, peminjaman, dan laporan fasilitas.</p></div>
                            <div className="cs-faq-list">
                                {faqs.map(([question, answer], index) => <details className="cs-reveal" key={question} style={{ '--reveal-delay': `${index * 45}ms` }}><summary>{question}<span className="cs-faq-indicator" aria-hidden="true"><Icon name="chevron" /></span></summary><p>{answer}</p></details>)}
                            </div>
                        </div>
                    </section>

                    <section className="cs-final cs-dark" aria-labelledby="final-title">
                        <div className="cs-wrap cs-reveal"><div><h2 id="final-title" className="cs-serif">Butuh fasilitas untuk kegiatanmu?</h2><p>Pilih fasilitas dan jadwal, lalu ajukan peminjaman.</p></div><a href={createReservationUrl} className="cs-button cs-button-primary">Ajukan reservasi <Icon name="arrow" className="cs-arrow" /></a></div>
                    </section>
                </main>

                <footer className="cs-footer cs-dark">
                    <div className="cs-wrap cs-footer-inner">
                        <a href="#atas" className="cs-brand" aria-label="CampuSpace, kembali ke atas"><Brand /></a>
                        <p>© {new Date().getFullYear()} CampuSpace</p>
                        <nav className="cs-footer-links" aria-label="Navigasi footer"><a href="#fasilitas">Fasilitas</a><a href="#cara-kerja">Cara reservasi</a><a href="#faq">FAQ</a></nav>
                    </div>
                </footer>
                <a href="#atas" className="cs-back-top" aria-label="Kembali ke atas"><Icon name="down" className="cs-arrow" /></a>
            </div>
        </>
    );
}
