// Minimal DOM for executing the actual page scripts without a browser dependency.
// Fetch deliberately ignores cancellation so tests also exercise stale-response guards.
export class DomEvent {
    constructor(type, options = {}) {
        this.type = type;
        this.bubbles = options.bubbles ?? false;
        Object.assign(this, options);
    }
    preventDefault() { this.defaultPrevented = true; }
}

function dataKey(name) {
    return name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export class Element {
    constructor(tagName = 'div') {
        this.tagName = tagName.toLowerCase();
        this.children = [];
        this.parentElement = null;
        this.dataset = {};
        this.style = {};
        this.attributes = new Map();
        this.listeners = new Map();
        this.value = '';
        this.hidden = false;
        this.open = false;
        this._text = '';
        this._html = '';
        const classes = new Set();
        this.classList = {
            add: (...names) => names.forEach(name => classes.add(name)),
            remove: (...names) => names.forEach(name => classes.delete(name)),
            contains: name => classes.has(name),
            toggle: (name, force) => {
                const enable = force ?? !classes.has(name);
                if (enable) classes.add(name); else classes.delete(name);
                return enable;
            },
        };
        Object.defineProperty(this, 'className', {
            get: () => [...classes].join(' '),
            set: value => { classes.clear(); String(value).split(/\s+/).filter(Boolean).forEach(name => classes.add(name)); },
        });
    }
    get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
    set textContent(value) { this.replaceChildren(); this._text = String(value); }
    get innerHTML() { return this._html; }
    set innerHTML(value) { this.replaceChildren(); this._html = value; }
    append(...children) { children.forEach(child => this.appendChild(child)); }
    appendChild(child) {
        if (child.parentElement) child.parentElement.children = child.parentElement.children.filter(node => node !== child);
        child.parentElement = this;
        this.children.push(child);
        return child;
    }
    replaceChildren(...children) {
        this.children.forEach(child => { child.parentElement = null; });
        this.children = [];
        this._text = '';
        this.append(...children);
    }
    setAttribute(name, value) {
        if (name === 'class') this.className = value;
        if (name.startsWith('data-')) this.dataset[dataKey(name)] = String(value);
        this.attributes.set(name, String(value));
    }
    getAttribute(name) {
        if (name === 'id') return this.id ?? null;
        if (name.startsWith('data-')) return this.dataset[dataKey(name)] ?? null;
        return this.attributes.get(name) ?? null;
    }
    removeAttribute(name) { this.attributes.delete(name); }
    matches(selector) {
        const tag = selector.match(/^[a-z]+/i)?.[0];
        if (tag && tag !== this.tagName) return false;
        const id = selector.match(/#([\w-]+)/)?.[1];
        if (id && id !== this.id) return false;
        for (const [, name] of selector.matchAll(/\.([\w-]+)/g)) if (!this.classList.contains(name)) return false;
        for (const [, name, value] of selector.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)) {
            const actual = name === 'open' ? (this.open ? '' : null) : this.getAttribute(name);
            if (actual === null || (value !== undefined && actual !== value)) return false;
        }
        return true;
    }
    querySelectorAll(selector) {
        const parts = selector.split(/\s+/);
        const nodes = [];
        const visit = parent => parent.children.forEach(child => {
            if (child.matches(parts.at(-1))) {
                let ancestor = child.parentElement;
                let index = parts.length - 2;
                while (ancestor && index >= 0) {
                    if (ancestor.matches(parts[index])) index--;
                    ancestor = ancestor.parentElement;
                }
                if (index < 0) nodes.push(child);
            }
            visit(child);
        });
        visit(this);
        return nodes;
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
    closest(selector) {
        let node = this;
        while (node) { if (node.matches(selector)) return node; node = node.parentElement; }
        return null;
    }
    contains(node) { return node === this || this.children.some(child => child.contains(node)); }
    get isConnected() { return this.root?.tagName === 'body'; }
    get root() { let node = this; while (node.parentElement) node = node.parentElement; return node; }
    addEventListener(type, handler, capture = false) {
        const handlers = this.listeners.get(type) ?? [];
        handlers.push({ handler, capture });
        this.listeners.set(type, handlers);
    }
    dispatchEvent(event) {
        event.target ??= this;
        const path = [];
        let node = this;
        while (node) { path.push(node); node = node.parentElement; }
        const invoke = (target, capture) => (target.listeners.get(event.type) ?? [])
            .filter(listener => Boolean(listener.capture) === capture)
            .forEach(listener => listener.handler.call(target, event));
        [...path].reverse().forEach(target => invoke(target, true));
        invoke(this, false);
        if (event.bubbles) path.slice(1).forEach(target => invoke(target, false));
        return !event.defaultPrevented;
    }
    emit(type, options = {}) { return this.dispatchEvent(new DomEvent(type, { bubbles: true, ...options })); }
    focus() { this.focused = true; }
    scrollIntoView() { this.scrolled = true; }
    reportValidity() { return true; }
}

export class ImageElement extends Element {
    constructor() { super('img'); }
}

export function element(tag, attributes = {}) {
    const node = tag === 'img' ? new ImageElement() : new Element(tag);
    Object.assign(node, attributes);
    return node;
}

export function domEnvironment() {
    const body = element('body');
    const htmlFragments = new Map();
    const requests = [];
    const consoleErrors = [];
    const alerts = [];
    const document = {
        body,
        getElementById: id => body.querySelector(`#${id}`),
        createElement: tag => {
            const node = element(tag);
            if (tag === 'template') {
                node.content = element('fragment');
                Object.defineProperty(node, 'innerHTML', {
                    set: html => node.content.replaceChildren(...(htmlFragments.get(html) ?? [])),
                });
            }
            return node;
        },
    };
    const history = { state: null, changes: [], replaceState(state, title, url) { this.changes.push(String(url)); } };
    const globals = {
        document,
        window: { location: { origin: 'http://localhost:8000' }, history },
        Event: DomEvent,
        HTMLImageElement: ImageElement,
        AbortController,
        URL,
        URLSearchParams,
        Intl,
        console: { error: error => consoleErrors.push(error) },
        alert: message => alerts.push(message),
        FormData: class {
            constructor(form) { this.entries = [...form.fields].map(([name, input]) => [name, input.value]); }
            [Symbol.iterator]() { return this.entries[Symbol.iterator](); }
        },
        fetch: (url, options) => new Promise((resolve, reject) => requests.push({ url: new URL(url, 'http://localhost:8000'), options, resolve, reject })),
    };
    return { body, document, globals, htmlFragments, requests, history, alerts, consoleErrors };
}

export function response({ status = 200, json, html, headers = {} } = {}) {
    return {
        status,
        ok: status >= 200 && status < 300,
        json: async () => json,
        text: async () => html,
        headers: { get: name => headers[name] ?? null },
    };
}

export const settle = () => new Promise(resolve => setImmediate(resolve));
