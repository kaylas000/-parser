import { HashRouter, Routes, Route, Link, useParams } from "react-router-dom";
import { useEffect, useState, useCallback, type CSSProperties, type ReactNode } from "react";
import { ALL_PRODUCTS, CATEGORIES, COMPANY, PRICES, DOCS, FAQ_ITEMS, FLEXBOARD, CALC_FORMS, getProductBySlug, getProductsByCategory, getCategoryBySlug, type Product } from "../data/kolormarket";
import { KolormarketIntro } from "./KolormarketIntro";
import { ForkliftScene } from "./ForkliftScene";

interface CartItem { product: Product; qty: number; }
let _cartItems: CartItem[] = [];
let _cartListeners: Array<() => void> = [];
function cartSubscribe(fn: () => void) { _cartListeners.push(fn); return () => { _cartListeners = _cartListeners.filter(l => l !== fn); }; }
function cartNotify() { _cartListeners.forEach(fn => fn()); }
function cartAdd(p: Product, qty = 1) { const ex = _cartItems.find(i => i.product.slug === p.slug); if (ex) ex.qty += qty; else _cartItems.push({ product: p, qty }); cartNotify(); }
function cartRemove(slug: string) { _cartItems = _cartItems.filter(i => i.product.slug !== slug); cartNotify(); }
function cartUpdateQty(slug: string, qty: number) { const it = _cartItems.find(i => i.product.slug === slug); if (it) { it.qty = Math.max(1, qty); cartNotify(); } }
function cartClear() { _cartItems = []; cartNotify(); }
function cartTotal() { return _cartItems.reduce((s, i) => s + i.qty, 0); }
function useCart() { const [, setTick] = useState(0); useEffect(() => cartSubscribe(() => setTick(v => v + 1)), []); return { items: _cartItems, add: cartAdd, remove: cartRemove, updateQty: cartUpdateQty, clear: cartClear, total: cartTotal() }; }

function Icon({ name, className = "w-5 h-5" }: { name: string; className?: string }) {
  const icons: Record<string, JSX.Element> = {
    pigment: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.04-.23-.29-.38-.63-.38-1.02 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.17-4.49-8.94-10-8.94z"/><circle cx="7.5" cy="11.5" r="1.5" fill="currentColor"/><circle cx="11" cy="7.5" r="1.5" fill="currentColor"/><circle cx="16.5" cy="9.5" r="1.5" fill="currentColor"/></svg>,
    flask: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 3h6M10 3v6.5L4.5 19.5a1 1 0 00.87 1.5h13.26a1 1 0 00.87-1.5L14 9.5V3"/><path d="M7 15h10"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg>,
    ti: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>,
    concrete: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 8h14l-1.5 12H6.5L5 8z"/><path d="M3 8h18"/><path d="M8 8V5a4 4 0 018 0v3"/></svg>,
    brick: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="10" height="5" rx="0.5"/><rect x="13" y="4" width="10" height="5" rx="0.5"/><rect x="6" y="10" width="10" height="5" rx="0.5"/><rect x="1" y="16" width="10" height="5" rx="0.5"/><rect x="13" y="16" width="10" height="5" rx="0.5"/></svg>,
    box: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M12 3v10"/><path d="M3 8l9 5 9-5"/></svg>,
    price: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="2" width="18" height="20" rx="1"/><path d="M7 7h10M7 11h10M7 15h6"/></svg>,
    doc: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a1 1 0 00-1 1v18a1 1 0 001 1h12a1 1 0 001-1V8l-6-6z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/></svg>,
    leaf: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75"/></svg>,
    calc: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="2" width="16" height="20" rx="1"/><rect x="7" y="5" width="10" height="4" rx="0.5" fill="currentColor" opacity="0.3"/><circle cx="8" cy="13" r="0.8" fill="currentColor"/><circle cx="12" cy="13" r="0.8" fill="currentColor"/><circle cx="16" cy="13" r="0.8" fill="currentColor"/><circle cx="8" cy="17" r="0.8" fill="currentColor"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/><circle cx="16" cy="17" r="0.8" fill="currentColor"/></svg>,
    help: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M9 9c0-1.66 1.34-3 3-3s3 1.34 3 3c0 2-3 2.5-3 4.5"/><circle cx="12" cy="18" r="0.5" fill="currentColor"/></svg>,
    phone: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.81.36 1.6.68 2.35a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.75.32 1.54.55 2.35.68A2 2 0 0122 16.92z"/></svg>,
    building: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="18" rx="0.5"/><rect x="14" y="8" width="7" height="13" rx="0.5"/><path d="M6 7h1M6 11h1M6 15h1M17 12h1M17 16h1"/><path d="M1 21h22"/></svg>,
  };
  return icons[name] || icons.box;
}

const CH: Record<string, string> = { Чехия: "#2271b3", Китай: "#c1121c", Индия: "#f7c500", Польша: "#e25303", Россия: "#57a639", Узбекистан: "#009739" };
function cx(...xs: Array<string | false | undefined>) { return xs.filter(Boolean).join(" "); }

const NAV = [
  { to: "/catalog", label: "Каталог", n: "01" },
  { to: "/prices", label: "Прайсы", n: "02" },
  { to: "/docs", label: "Документы", n: "03" },
  { to: "/flexboard", label: "Флексборд", n: "04" },
  { to: "/calculator", label: "Калькулятор", n: "05" },
  { to: "/faq", label: "Помощь", n: "06" },
  { to: "/about", label: "О компании", n: "07" },
  { to: "/contacts", label: "Контакты", n: "08" },
];

function Shell({ children }: { children: ReactNode }) {
  return (<div className="pp-scope min-h-screen bg-coal text-concrete"><div className="noise-layer" aria-hidden="true"/><div className="pp-vignette" aria-hidden="true"/><Header/><main>{children}</main><Foot/></div>);
}

function Header() {
  const [open, setOpen] = useState(false);
  const cart = useCart();
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="lg:hidden">
        <div className="border-b border-steel/70 bg-coal/95">
          <div className="flex h-14 items-center gap-3 px-4">
            <Link to="/" className="flex min-w-0 items-center gap-2" onClick={() => setOpen(false)}>
              <span className="grid h-8 w-8 shrink-0 place-items-center bg-heat font-display text-[11px] font-bold leading-none text-coal">КМ</span>
              <span className="truncate font-display text-[12px] tracking-[0.16em] text-concrete">KOLORMARKET</span>
            </Link>
            <Link to="/cart" className="ml-auto grid h-11 w-11 shrink-0 place-items-center border border-steel-2 text-heat hover:bg-heat hover:text-coal relative">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              {cart.total > 0 && <span className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center bg-heat font-mono text-[8px] font-bold text-coal rounded-full">{cart.total}</span>}
            </Link>
            <a href={COMPANY.phoneHref} className="grid h-11 w-11 shrink-0 place-items-center border border-steel-2 text-heat hover:bg-heat hover:text-coal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.5 4.5c0 8.3 6.7 15 15 15l1.8-3.6-4-2-1.9 1.9c-3-1.2-5-3.2-6.2-6.2l1.9-1.9-2-4z" strokeLinejoin="round"/></svg>
            </a>
            <button onClick={() => setOpen(v => !v)} aria-expanded={open} className="grid h-11 w-11 shrink-0 place-items-center border border-steel-2 hover:border-concrete">
              <span className="flex flex-col gap-[5px]"><span className={cx("block h-0.5 w-5 bg-concrete transition-transform duration-300", open && "translate-y-[3.5px] rotate-45")}/><span className={cx("block h-0.5 w-5 bg-concrete transition-transform duration-300", open && "-translate-y-[3.5px] -rotate-45")}/></span>
            </button>
          </div>
        </div>
        <div className="grid transition-[grid-template-rows] duration-500" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
          <div className="overflow-hidden">
            <nav className="border-b-2 border-steel bg-coal-2/95 px-4 pb-6 pt-2 shadow-[0_18px_30px_rgba(0,0,0,0.45)]">
              {NAV.map(n => (<Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="flex items-center justify-between border-b border-steel/50 py-4 font-display text-lg font-bold uppercase tracking-wide text-concrete active:text-heat">{n.label}<span className="font-mono text-[11px] text-heat">{n.n}</span></Link>))}
              <div className="mt-4 space-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-fog"><p>{COMPANY.address}</p><p>{COMPANY.officeHours}</p><a href={COMPANY.phoneHref} className="block font-bold text-concrete">{COMPANY.phone}</a><a href={`mailto:${COMPANY.email}`} className="block">{COMPANY.email}</a><a href={`mailto:${COMPANY.emailReserve}`} className="block text-fog-2">{COMPANY.emailReserve}</a></div>
            </nav>
          </div>
        </div>
      </div>
      <div className="hidden border-b border-steel/70 bg-coal/95 lg:block">
        <nav><div className="mx-auto flex h-12 max-w-[1400px] items-center gap-1 px-6">
          <Link to="/" className="mr-4 flex shrink-0 items-center gap-2"><span className="grid h-7 w-7 place-items-center bg-heat font-display text-[10px] font-bold leading-none text-coal">КМ</span><span className="font-display text-[13px] tracking-[0.2em] text-concrete">KOLORMARKET</span></Link>
          <div className="flex flex-1 items-center gap-1 overflow-x-auto">{NAV.map(n => (<Link key={n.to} to={n.to} className="group shrink-0 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-fog hover:bg-concrete hover:text-coal"><span className="mr-1 text-heat group-hover:text-heat-2">{n.n}</span>{n.label}</Link>))}</div>
          <Link to="/cart" className="ml-2 shrink-0 relative border-2 border-steel-2 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-fog hover:border-heat hover:text-heat">
            <svg className="inline w-4 h-4 mr-1 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Корзина{cart.total > 0 && <span className="ml-1 text-heat">({cart.total})</span>}
          </Link>
          <a href={COMPANY.phoneHref} className="ml-2 shrink-0 border-2 border-heat bg-heat px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-coal hover:bg-transparent hover:text-heat">Позвонить</a>
        </div></nav>
      </div>
    </header>
  );
}

function Foot() {
  return (
    <footer className="border-t-2 border-steel bg-[#101114]">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div><div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center bg-heat font-display text-[10px] font-bold leading-none text-coal">КМ</span><span className="font-display text-sm tracking-[0.15em]">KOLORMARKET</span></div><p className="mt-4 font-mono text-xs leading-relaxed text-fog">{COMPANY.description}</p></div>
          <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-heat">Каталог</p>{CATEGORIES.map(c => <Link key={c.id} to={`/catalog/${c.slug}`} className="mt-2 block font-mono text-xs text-fog hover:text-concrete">{c.title} ({c.count})</Link>)}</div>
          <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-heat">Информация</p>{NAV.map(n => <Link key={n.to} to={n.to} className="mt-2 block font-mono text-xs text-fog hover:text-concrete">{n.label}</Link>)}</div>
          <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-heat">Контакты</p><a href={COMPANY.phoneHref} className="mt-2 block font-display text-sm font-bold text-concrete">{COMPANY.phone}</a><a href={`mailto:${COMPANY.email}`} className="mt-1 block font-mono text-xs text-fog">{COMPANY.email}</a><a href={`mailto:${COMPANY.emailReserve}`} className="mt-0.5 block font-mono text-[10px] text-fog-2">{COMPANY.emailReserve}</a><p className="mt-2 font-mono text-xs text-fog">{COMPANY.address}</p><p className="mt-1 font-mono text-[10px] text-fog-2">{COMPANY.officeHours}</p></div>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-steel pt-4"><span className="font-mono text-[10px] text-fog-2">© {COMPANY.fullName}, с {COMPANY.since} года</span><span className="font-mono text-[10px] text-fog-2">Информация на сайте не является публичной офертой</span></div>
      </div>
    </footer>
  );
}

function HomePage() { return (<><Hero/><CategoryMarquee/><AboutSection/><CatalogGrid/><QuickLinks/></>); }

function Hero() {
  return (
    <section className="relative bg-coal pt-[76px] lg:pt-[86px]">
      <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden="true"/>
      <div className="heat-glow pointer-events-none absolute inset-0" aria-hidden="true"/>
      <div className="relative mx-auto max-w-[1400px] px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:min-h-[500px] lg:pb-20">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-fog lg:max-w-[55%]"><span className="border border-steel-2 px-2 py-0.5">{COMPANY.fullName}</span><span className="ml-3 hidden min-[360px]:inline">поставщик химического сырья · {COMPANY.city}</span></p>
        <h1 className="mt-5 font-display text-[clamp(1.6rem,7.2vw,5.6rem)] font-black uppercase leading-[0.94] tracking-tight sm:mt-6 lg:max-w-[55%]">Пигменты, <span className="text-heat">красители</span> и добавки</h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-fog sm:mt-6 sm:text-lg lg:max-w-[55%]">Поставка неорганических и органических пигментов, диоксида титана, добавок в бетон и форм для тротуарной плитки.<span className="font-semibold text-concrete"> С {COMPANY.since} года на российском рынке.</span></p>
        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
          <Link to="/catalog" className="border-2 border-heat bg-heat px-6 py-3.5 text-center font-display text-sm font-bold uppercase tracking-[0.12em] text-coal hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(255,106,43,0.4)]">Каталог продукции</Link>
          <Link to="/contacts" className="border-2 border-steel-2 px-6 py-3.5 text-center font-display text-sm font-bold uppercase tracking-[0.12em] text-concrete hover:-translate-y-0.5 hover:border-concrete hover:bg-concrete hover:text-coal">Позвонить</Link>
        </div>
        <div className="relative mt-8 aspect-[16/9] overflow-hidden border-2 border-steel bg-coal-2 sm:mt-10 lg:absolute lg:top-8 lg:right-0 lg:mt-0 lg:h-[420px] lg:w-[42%] lg:aspect-auto">
          <ForkliftScene/>
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between sm:bottom-3 sm:left-3 sm:right-3">
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-fog-2 sm:text-[9px]">Склад · Химки · ул. Заводская 21</span>
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-heat sm:text-[9px]">LIVE</span>
          </div>
        </div>
        <dl className="mt-8 grid max-w-lg grid-cols-2 gap-px border-2 border-steel bg-steel sm:mt-10 sm:grid-cols-4 lg:max-w-[55%]">
          {[["212+", "товаров в каталоге"], ["30", "лет на рынке"], ["6", "категорий продукции"], ["6", "стран-производителей"]].map(([v, l]) => (
            <div key={l} className="min-w-0 bg-coal-2 px-3 py-3 sm:px-4 sm:py-3.5"><dt className="font-display text-lg font-bold leading-none text-concrete sm:text-xl">{v}</dt><dd className="mt-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-fog-2 sm:text-[9px]">{l}</dd></div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function CategoryMarquee() {
  return (
    <div className="marquee-paused relative overflow-hidden border-y-2 border-steel bg-coal-2 py-3">
      <div className="marquee-track flex w-max items-center" style={{ "--marquee-speed": "32s" } as CSSProperties}>
        {[0, 1].map(d => (<div key={d} className="flex items-center" aria-hidden={d === 1}>{CATEGORIES.map(c => <Link key={c.id + d} to={`/catalog/${c.slug}`} className="flex items-center"><span className="ml-6 text-heat"><Icon name={c.icon}/></span><span className="px-2 font-mono text-[11px] uppercase tracking-[0.18em] text-fog">{c.title}</span><span className="font-mono text-[10px] text-heat">{c.count}</span></Link>)}</div>))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-coal-2 to-transparent"/>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-coal-2 to-transparent"/>
    </div>
  );
}

function AboutSection() {
  return (
    <section className="relative bg-coal"><div className="diag-steel pointer-events-none absolute inset-0" aria-hidden="true"/>
      <div className="relative mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
          <div><h2 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">О компании</h2><p className="mt-4 max-w-2xl text-sm leading-relaxed text-fog sm:text-base">{COMPANY.about[0]}</p><p className="mt-4 max-w-2xl text-sm leading-relaxed text-fog sm:text-base">{COMPANY.about[1]}</p><Link to="/about" className="mt-5 inline-block border-2 border-steel-2 px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider text-fog hover:-translate-y-0.5 hover:border-heat hover:text-heat">Подробнее о компании →</Link></div>
          <div className="border-2 border-steel bg-coal-2 p-5 shadow-[8px_8px_0_rgba(0,0,0,0.3)] relative overflow-hidden"><div className="hazard absolute top-0 left-0 right-0 h-1" aria-hidden="true"/><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-heat mt-1">Дистрибьютор</p><div className="mt-3 space-y-2 font-mono text-xs text-fog"><p><span className="text-concrete">Precheza</span> — Чехия, неорганические пигменты и TiO₂</p><p><span className="text-concrete">Tongchem</span> — Китай, железоокисные пигменты</p><p><span className="text-concrete">VIPUL ORGANICS</span> — Индия, органические пигменты</p><p><span className="text-concrete">Lomon Billions</span> — Китай, диоксид титана</p><p><span className="text-concrete">ALPHA</span> — Польша, формы для плитки</p></div></div>
        </div>
      </div>
    </section>
  );
}

function CatalogGrid() {
  return (
    <section className="relative bg-coal-2"><div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-20">
      <h2 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">Каталог продукции</h2>
      <p className="mt-3 max-w-xl font-mono text-sm text-fog">Шесть направлений химического сырья — от пигментов до форм для плитки</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{CATEGORIES.map((cat) => (<Link key={cat.id} to={`/catalog/${cat.slug}`} className="group flex min-h-[44px] flex-col border-2 border-steel bg-coal p-5 hover:-translate-y-0.5 hover:border-heat hover:shadow-[6px_6px_0_rgba(255,106,43,0.3)]"><div className="flex items-center justify-between"><span className="text-heat"><Icon name={cat.icon} className="w-6 h-6"/></span><span className="font-mono text-xs font-bold text-heat">{cat.count}</span></div><h3 className="mt-3 font-display text-sm font-bold uppercase tracking-wide text-concrete group-hover:text-heat">{cat.title}</h3><p className="mt-2 font-mono text-[11px] leading-relaxed text-fog">{cat.description}</p></Link>))}</div>
    </div></section>
  );
}

function QuickLinks() {
  const links = [{ to: "/prices", icon: "price", title: "Прайс-листы", desc: "Скачать актуальные прайсы" }, { to: "/docs", icon: "doc", title: "Документация", desc: "MSDS, сертификаты ISO" }, { to: "/flexboard", icon: "leaf", title: "Флексборд", desc: "Гибкий бордюр для ландшафта" }, { to: "/calculator", icon: "calc", title: "Калькулятор", desc: "Расчёт форм для плитки" }, { to: "/faq", icon: "help", title: "Помощь", desc: "Часто задаваемые вопросы" }, { to: "/contacts", icon: "phone", title: "Контакты", desc: "Офис и склад в Химках" }, { to: "/about", icon: "building", title: "О компании", desc: `${COMPANY.fullName} с ${COMPANY.since}` }];
  return (
    <section className="border-t-2 border-steel bg-coal"><div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{links.map(l => <Link key={l.to} to={l.to} className="group flex min-h-[44px] items-start gap-3 border border-steel bg-coal-2 p-4 hover:border-heat"><span className="text-heat"><Icon name={l.icon}/></span><div><p className="font-display text-sm font-bold uppercase text-concrete group-hover:text-heat">{l.title}</p><p className="mt-1 font-mono text-[10px] text-fog-2">{l.desc}</p></div></Link>)}</div>
    </div></section>
  );
}

function CatalogPage() {
  return (<div className="pt-[76px] lg:pt-[86px]"><div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
    <Bc items={[["Каталог"]]}/>
    <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Каталог продукции</h1>
    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{CATEGORIES.map((cat) => <Link key={cat.id} to={`/catalog/${cat.slug}`} className="group flex min-h-[44px] flex-col border-2 border-steel bg-coal-2 p-5 hover:-translate-y-0.5 hover:border-heat"><div className="flex items-center justify-between"><span className="text-heat"><Icon name={cat.icon} className="w-6 h-6"/></span><span className="font-mono text-xs font-bold text-heat">{cat.count}</span></div><h3 className="mt-3 font-display text-sm font-bold uppercase tracking-wide text-concrete group-hover:text-heat">{cat.title}</h3><p className="mt-2 font-mono text-[11px] leading-relaxed text-fog">{cat.description}</p></Link>)}</div>
  </div></div>);
}

function CategoryPage() {
  const { slug } = useParams();
  const cat = getCategoryBySlug(slug || "");
  const products = getProductsByCategory(slug || "");
  if (!cat) return <NotFoundPage/>;
  return (<div className="pt-[76px] lg:pt-[86px]"><div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
    <Bc items={[["Каталог", "/catalog"], [cat.title]]}/>
    <div className="flex items-center gap-3"><span className="text-heat"><Icon name={cat.icon} className="w-8 h-8"/></span><div><h1 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">{cat.title}</h1><p className="mt-1 font-mono text-xs text-fog">{products.length} товаров</p></div></div>
    <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map(p => <PC key={p.slug} product={p}/>)}</div>
  </div></div>);
}

function PC({ product: p }: { product: Product }) {
  return (
    <Link to={`/product/${p.slug}`} className="group flex min-h-[44px] flex-col border border-steel bg-coal-2 hover:-translate-y-0.5 hover:border-heat">
      <div className="aspect-square bg-coal-3 flex items-center justify-center overflow-hidden">{p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-contain p-4 group-hover:scale-105" loading="lazy"/> : <span className="font-mono text-4xl text-steel-2">?</span>}</div>
      <div className="flex flex-1 flex-col p-3"><h3 className="font-display text-[11px] font-bold uppercase tracking-wide text-concrete group-hover:text-heat line-clamp-2">{p.name}</h3><div className="mt-auto flex items-center gap-2 pt-2">{p.country && <span className="flex items-center gap-1"><span className="h-2 w-2 border border-steel-2" style={{ background: CH[p.country] || "#4b505c" }}/><span className="font-mono text-[9px] uppercase text-fog-2">{p.country}</span></span>}{p.availability && <span className={cx("ml-auto font-mono text-[9px] uppercase", p.availability === "В наличии" ? "text-ok" : "text-amber")}>{p.availability}</span>}</div></div>
    </Link>
  );
}

function ProductPage() {
  const { slug } = useParams();
  const product = getProductBySlug(slug || "");
  const cart = useCart();
  const [added, setAdded] = useState(false);
  useEffect(() => { window.scrollTo(0, 0); setAdded(false); }, [slug]);
  if (!product) return <NotFoundPage/>;
  const p = product;
  const related = getProductsByCategory(p.categorySlug).filter(r => r.slug !== p.slug).slice(0, 4);
  const addToCart = () => { cart.add(p); setAdded(true); setTimeout(() => setAdded(false), 2000); };
  return (<div className="pt-[76px] lg:pt-[86px]"><div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
    <Bc items={[["Каталог", "/catalog"], [p.category, `/catalog/${p.categorySlug}`], [p.name]]}/>
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <div className="flex aspect-square items-center justify-center overflow-hidden border-2 border-steel bg-coal-3">{p.image ? <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain p-6"/> : <span className="font-mono text-6xl text-steel-2">?</span>}</div>
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">{p.name}</h1>
        {p.availability && <span className={cx("mt-3 inline-block border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider", p.availability === "В наличии" ? "border-ok text-ok" : "border-amber text-amber")}>{p.availability}</span>}
        <div className="mt-6 space-y-2">{p.country && <IR label="Страна" value={p.country}/>}{p.manufacturer && <IR label="Производитель" value={p.manufacturer}/>}<IR label="Категория" value={p.category}/>{p.subcategory && <IR label="Подкатегория" value={p.subcategory}/>}</div>
        <div className="mt-6 flex gap-3">
          <button onClick={addToCart} className="border-2 border-heat bg-heat px-6 py-3 font-display text-sm font-bold uppercase tracking-[0.12em] text-coal hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(255,106,43,0.4)]">{added ? "Добавлено!" : "В корзину"}</button>
          <Link to="/cart" className="border-2 border-steel-2 px-6 py-3 font-display text-sm font-bold uppercase tracking-[0.12em] text-concrete hover:-translate-y-0.5 hover:border-concrete hover:bg-concrete hover:text-coal">Оформить</Link>
        </div>
        <div className="mt-8 border-2 border-steel bg-coal-2 p-5 shadow-[6px_6px_0_rgba(0,0,0,0.3)] relative overflow-hidden"><div className="hazard absolute top-0 left-0 right-0 h-1" aria-hidden="true"/><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-heat mt-1">Заказ и консультация</p><a href={COMPANY.phoneHref} className="mt-3 block font-display text-xl font-bold text-concrete">{COMPANY.phone}</a><a href={`mailto:${COMPANY.email}`} className="mt-1 block font-mono text-xs text-fog">{COMPANY.email}</a><a href={`mailto:${COMPANY.emailReserve}`} className="mt-0.5 block font-mono text-[10px] text-fog-2">{COMPANY.emailReserve}</a><p className="mt-2 font-mono text-[10px] text-fog-2">{COMPANY.officeHours}</p></div>
      </div>
    </div>
    {related.length > 0 && <section className="mt-16"><h2 className="font-display text-xl font-bold uppercase tracking-wide">Похожие товары</h2><div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{related.map(r => <PC key={r.slug} product={r}/>)}</div></section>}
  </div></div>);
}

function IR({ label, value }: { label: string; value: string }) {
  return <div className="flex items-baseline gap-3 border-b border-steel/50 py-2"><span className="w-36 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-fog-2">{label}</span><span className="font-mono text-sm text-concrete">{value}</span></div>;
}

function PricesPage() {
  return (<div className="pt-[76px] lg:pt-[86px]"><div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
    <Bc items={[["Прайс-листы"]]}/><h1 className="font-display text-3xl font-bold uppercase tracking-wide">Прайс-листы</h1>
    <p className="mt-3 max-w-xl font-mono text-sm text-fog">Скачайте актуальные прайс-листы. Для индивидуальных условий — позвоните {COMPANY.phone}.</p>
    <div className="mt-8 space-y-3">{PRICES.map((p) => <a key={p.url} href={p.url} target="_blank" rel="noreferrer" className="group flex min-h-[44px] items-center justify-between border-2 border-steel bg-coal-2 p-4 hover:border-heat"><div className="flex items-center gap-3"><span className="font-mono text-[10px] uppercase text-heat">{(p as any).format || "PDF"}</span><span className="font-display text-sm font-bold text-concrete group-hover:text-heat">{p.title}</span></div><span className="font-mono text-[10px] uppercase tracking-wider text-heat">Скачать ↓</span></a>)}</div>
  </div></div>);
}

function DocsPage() {
  return (<div className="pt-[76px] lg:pt-[86px]"><div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
    <Bc items={[["Документация"]]}/><h1 className="font-display text-3xl font-bold uppercase tracking-wide">Документация</h1>
    <section className="mt-8"><h2 className="font-display text-xl font-bold uppercase tracking-wide">Паспорта безопасности (MSDS)</h2><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{DOCS.msds.map((d) => <DL key={d.url} {...d}/>)}</div></section>
    <section className="mt-12"><h2 className="font-display text-xl font-bold uppercase tracking-wide">Сертификаты</h2><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{DOCS.certificates.map((d) => <DL key={d.url} {...d}/>)}</div></section>
  </div></div>);
}

function DL({ name, url }: { name: string; url: string }) {
  return <a href={url} target="_blank" rel="noreferrer" className="group flex min-h-[44px] items-center gap-2 border border-steel bg-coal-2 p-3 hover:border-heat"><span className="font-mono text-[10px] uppercase text-heat">PDF</span><span className="font-mono text-xs text-fog group-hover:text-concrete">{name}</span></a>;
}

function AboutPage() {
  return (<div className="pt-[76px] lg:pt-[86px]"><div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
    <Bc items={[["О компании"]]}/><h1 className="font-display text-3xl font-bold uppercase tracking-wide">О компании</h1>
    <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-4">{COMPANY.about.map((p, i) => <p key={i} className="font-mono text-sm leading-relaxed text-fog">{p}</p>)}</div>
      <div className="border-2 border-steel bg-coal-2 p-5 shadow-[8px_8px_0_rgba(0,0,0,0.3)] relative overflow-hidden"><div className="hazard absolute top-0 left-0 right-0 h-1" aria-hidden="true"/><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-heat mt-1">Контакты</p><div className="mt-4 space-y-4 font-mono text-sm"><div><span className="block text-[10px] uppercase text-fog-2">Телефон/факс</span><a href={COMPANY.phoneHref} className="font-bold text-concrete">{COMPANY.phone}</a></div><div><span className="block text-[10px] uppercase text-fog-2">Email (основной)</span><a href={`mailto:${COMPANY.email}`} className="text-fog">{COMPANY.email}</a></div><div><span className="block text-[10px] uppercase text-fog-2">Email (резервный)</span><a href={`mailto:${COMPANY.emailReserve}`} className="text-fog">{COMPANY.emailReserve}</a></div><div><span className="block text-[10px] uppercase text-fog-2">Офис</span><span className="text-fog">{COMPANY.address}</span></div><div><span className="block text-[10px] uppercase text-fog-2">Склад</span><span className="text-fog">{COMPANY.warehouse}</span></div><div><span className="block text-[10px] uppercase text-fog-2">Режим работы</span><span className="text-fog">{COMPANY.officeHours}</span></div></div></div>
    </div>
  </div></div>);
}

function ContactsPage() {
  return (<div className="pt-[76px] lg:pt-[86px]"><div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
    <Bc items={[["Контакты"]]}/><h1 className="font-display text-3xl font-bold uppercase tracking-wide">Контакты</h1>
    <div className="mt-8 grid gap-6 sm:grid-cols-2">
      <div className="border-2 border-steel bg-coal-2 p-5 shadow-[6px_6px_0_rgba(0,0,0,0.3)] relative overflow-hidden"><div className="hazard absolute top-0 left-0 right-0 h-1" aria-hidden="true"/><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-heat mt-1">{COMPANY.fullName} — Офис</p><div className="mt-4 space-y-3 font-mono text-sm"><div><span className="block text-[10px] uppercase text-fog-2">Адрес</span><span className="text-fog">{COMPANY.address}</span></div><div><span className="block text-[10px] uppercase text-fog-2">Телефон/факс</span><a href={COMPANY.phoneHref} className="font-bold text-concrete">{COMPANY.phone}</a></div><div><span className="block text-[10px] uppercase text-fog-2">Email (основной)</span><a href={`mailto:${COMPANY.email}`} className="text-fog">{COMPANY.email}</a></div><div><span className="block text-[10px] uppercase text-fog-2">Email (резервный)</span><a href={`mailto:${COMPANY.emailReserve}`} className="text-fog">{COMPANY.emailReserve}</a></div><div><span className="block text-[10px] uppercase text-fog-2">Режим работы</span><span className="text-fog">{COMPANY.officeHours}</span></div></div><div className="mt-4 border-2 border-amber bg-amber/10 p-3"><p className="font-mono text-[11px] font-bold uppercase text-amber">Внимание!</p><p className="mt-1 font-mono text-xs text-fog">Перед посещением нашего офиса, просьба предупредить о визите за 15–30 минут!</p></div><a href={COMPANY.mapUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block border-2 border-heat bg-heat px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-coal hover:-translate-y-0.5">Офис на карте →</a></div>
      <div className="border-2 border-steel bg-coal-2 p-5 shadow-[6px_6px_0_rgba(0,0,0,0.3)] relative overflow-hidden"><div className="hazard absolute top-0 left-0 right-0 h-1" aria-hidden="true"/><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-heat mt-1">{COMPANY.fullName} — Склад</p><div className="mt-4 space-y-3 font-mono text-sm"><div><span className="block text-[10px] uppercase text-fog-2">Адрес</span><span className="text-fog">{COMPANY.warehouse}</span></div><div><span className="block text-[10px] uppercase text-fog-2">Режим работы</span><span className="text-fog">{COMPANY.warehouseHours}</span></div></div><a href={COMPANY.warehouseMapUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block border-2 border-heat bg-heat px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-coal hover:-translate-y-0.5">Склад на карте →</a></div>
    </div>
  </div></div>);
}

function FaqPage() {
  const [open, setOpen] = useState<number | null>(null);
  return (<div className="pt-[76px] lg:pt-[86px]"><div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
    <Bc items={[["Помощь"]]}/><h1 className="font-display text-3xl font-bold uppercase tracking-wide">Часто задаваемые вопросы</h1>
    <div className="mt-8 space-y-3">{FAQ_ITEMS.map((item, i) => <div key={i} className="border-2 border-steel bg-coal-2"><button onClick={() => setOpen(open === i ? null : i)} className="flex min-h-[44px] w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-coal-3"><span className="font-display text-sm font-bold uppercase tracking-wide text-concrete">{item.q}</span><span className="shrink-0 font-mono text-lg text-heat">{open === i ? "−" : "+"}</span></button>{open === i && <div className="border-t border-steel px-5 py-4"><p className="font-mono text-sm leading-relaxed text-fog">{item.a}</p></div>}</div>)}</div>
  </div></div>);
}

function FlexboardPage() {
  const fb = FLEXBOARD;
  return (<div className="pt-[76px] lg:pt-[86px]"><div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
    <Bc items={[["Флексборд"]]}/><h1 className="font-display text-3xl font-bold uppercase tracking-wide">{fb.title}</h1><p className="mt-3 max-w-2xl font-mono text-sm text-fog">{fb.subtitle}</p>
    <p className="mt-6 max-w-3xl font-mono text-sm leading-relaxed text-fog">{fb.description}</p>
    <section className="mt-10"><h2 className="font-display text-xl font-bold uppercase tracking-wide">Использование</h2><div className="mt-4 space-y-3">{fb.features.map((f, i) => <div key={i} className="flex items-start gap-3 border-l-2 border-heat pl-4"><p className="font-mono text-sm text-fog">{f}</p></div>)}</div></section>
    <section className="mt-10"><h2 className="font-display text-xl font-bold uppercase tracking-wide">Галерея</h2><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{fb.images.map((img, i) => <div key={i} className="aspect-square overflow-hidden border border-steel bg-coal-3"><img src={img} alt={`Флексборд ${i + 1}`} className="h-full w-full object-cover" loading="lazy"/></div>)}</div></section>
    <section className="mt-10"><h2 className="font-display text-xl font-bold uppercase tracking-wide">Технические данные</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[500px] border-2 border-steel"><thead><tr className="bg-coal-3"><th className="border border-steel px-3 py-2 text-left font-mono text-[10px] uppercase text-fog-2">Параметр</th>{fb.specs.map(s => <th key={s.name} className="border border-steel px-3 py-2 text-left font-mono text-[10px] uppercase text-heat">{s.name}</th>)}</tr></thead><tbody>{[["Длина", ...fb.specs.map(s => s.length)], ["Высота", ...fb.specs.map(s => s.height)], ["Ширина", ...fb.specs.map(s => s.width)], ["Вес", ...fb.specs.map(s => s.weight)], ["Толщина стенки", ...fb.specs.map(s => s.wall)]].map(([label, ...vals]) => (<tr key={label} className="bg-coal-2"><td className="border border-steel px-3 py-2 font-mono text-xs text-fog-2">{label}</td>{vals.map((v, i) => <td key={i} className="border border-steel px-3 py-2 font-mono text-xs text-concrete">{v}</td>)}</tr>))}</tbody></table></div><div className="mt-4 border border-steel bg-coal-2 p-4"><p className="font-mono text-[10px] uppercase text-heat">Пластиковый анкер</p><p className="mt-2 font-mono text-xs text-fog">Длина: {fb.anchor.length} · Ширина: {fb.anchor.width} · Вес: {fb.anchor.weight}</p></div></section>
    <section className="mt-10"><h2 className="font-display text-xl font-bold uppercase tracking-wide">Монтаж</h2><div className="mt-4 space-y-3">{fb.install.map((step, i) => <div key={i} className="flex items-start gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center border border-heat font-mono text-xs font-bold text-heat">{i + 1}</span><p className="font-mono text-sm text-fog">{step}</p></div>)}</div></section>
  </div></div>);
}

function CalculatorPage() {
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [activeSeries, setActiveSeries] = useState<string | null>(null);
  const series = [...new Set(CALC_FORMS.map(f => f.series))];
  const setQty = (art: string, val: string) => { const n = Math.max(0, parseInt(val) || 0); setQtys(prev => ({ ...prev, [art]: n })); };
  const filtered = CALC_FORMS.filter(f => { const matchSearch = !search || f.art.toLowerCase().includes(search.toLowerCase()) || f.name.toLowerCase().includes(search.toLowerCase()); const matchSeries = !activeSeries || f.series === activeSeries; return matchSearch && matchSeries; });
  const totals = CALC_FORMS.reduce((acc, f) => { const qty = qtys[f.art] || 0; acc.count += qty; acc.weight += qty * f.weight; acc.volume += qty * f.volume; acc.price += qty * f.price; return acc; }, { count: 0, weight: 0, volume: 0, price: 0 });
  const hasItems = totals.count > 0;

  return (<div className="pt-[76px] lg:pt-[86px]"><div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
    <Bc items={[["Калькулятор"]]}/><h1 className="font-display text-3xl font-bold uppercase tracking-wide">Калькулятор форм</h1>
    <p className="mt-3 max-w-xl font-mono text-sm text-fog">Рассчитайте количество форм для тротуарной плитки.</p>
    <div className="mt-6"><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по артикулу или названию..." className="w-full max-w-md bg-coal-2 border border-steel px-4 py-3 font-mono text-sm text-concrete placeholder:text-fog-2 focus:border-heat focus:outline-none" style={{ fontSize: "16px" }}/></div>
    <div className="mt-4 flex flex-wrap gap-2">
      <button onClick={() => setActiveSeries(null)} className={`px-4 py-2 font-mono text-[11px] uppercase tracking-wider border transition-colors duration-200 ${!activeSeries ? "bg-heat text-coal border-heat" : "bg-coal-2 text-fog border-steel hover:border-concrete"}`}>Все ({CALC_FORMS.length})</button>
      {series.map(s => <button key={s} onClick={() => setActiveSeries(activeSeries === s ? null : s)} className={`px-4 py-2 font-mono text-[11px] uppercase tracking-wider border transition-colors duration-200 ${activeSeries === s ? "bg-heat text-coal border-heat" : "bg-coal-2 text-fog border-steel hover:border-concrete"}`}>{s} ({CALC_FORMS.filter(f => f.series === s).length})</button>)}
    </div>
    <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[900px] border-2 border-steel"><thead><tr className="bg-coal-3">
      <th className="border border-steel px-2 py-2.5 text-left font-mono text-[10px] uppercase text-fog-2 w-10">№</th>
      <th className="border border-steel px-2 py-2.5 text-left font-mono text-[10px] uppercase text-fog-2 w-20">Арт</th>
      <th className="border border-steel px-2 py-2.5 text-left font-mono text-[10px] uppercase text-fog-2">Наименование</th>
      <th className="border border-steel px-2 py-2.5 text-center font-mono text-[10px] uppercase text-fog-2 w-24">Заявка (шт)</th>
      <th className="border border-steel px-2 py-2.5 text-right font-mono text-[10px] uppercase text-fog-2 w-24">Вес (кг)</th>
      <th className="border border-steel px-2 py-2.5 text-right font-mono text-[10px] uppercase text-fog-2 w-24">Объём (м³)</th>
      <th className="border border-steel px-2 py-2.5 text-right font-mono text-[10px] uppercase text-fog-2 w-28">Стоимость (р)</th>
    </tr></thead><tbody>{filtered.map((f, i) => { const qty = qtys[f.art] || 0; return (
      <tr key={f.art} className={`${qty > 0 ? "bg-coal-3/50" : "bg-coal-2"} hover:bg-coal-3 transition-colors duration-150`}>
        <td className="border border-steel px-2 py-2 font-mono text-xs text-fog-2">{i + 1}</td>
        <td className="border border-steel px-2 py-2 font-mono text-xs text-heat font-bold">{f.art}</td>
        <td className="border border-steel px-2 py-2 font-mono text-xs text-concrete">{f.name}</td>
        <td className="border border-steel px-1 py-1"><input type="number" min="0" value={qty || ""} onChange={e => setQty(f.art, e.target.value)} className="w-full bg-coal border border-steel-2 px-2 py-2 font-mono text-xs text-concrete text-center focus:border-heat focus:outline-none" style={{ fontSize: "16px" }} placeholder="0"/></td>
        <td className="border border-steel px-2 py-2 font-mono text-xs text-fog text-right">{qty * f.weight > 0 ? (qty * f.weight).toFixed(1) : "0"}</td>
        <td className="border border-steel px-2 py-2 font-mono text-xs text-fog text-right">{qty * f.volume > 0 ? (qty * f.volume).toFixed(3) : "0"}</td>
        <td className="border border-steel px-2 py-2 font-mono text-xs text-fog text-right">{qty * f.price > 0 ? (qty * f.price).toLocaleString("ru-RU") : "0"}</td>
      </tr>);})}{filtered.length === 0 && <tr><td colSpan={7} className="border border-steel px-4 py-8 text-center font-mono text-sm text-fog-2">Ничего не найдено</td></tr>}</tbody></table></div>
    <div className={`mt-6 border-2 bg-coal-2 p-5 transition-colors duration-200 ${hasItems ? "border-heat" : "border-steel"}`}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fog-2">Количество</p><p className="mt-1 font-display text-xl font-bold text-concrete">{totals.count} шт</p></div>
        <div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fog-2">Вес</p><p className="mt-1 font-display text-xl font-bold text-concrete">{totals.weight > 0 ? `${totals.weight.toFixed(1)} кг` : "—"}</p></div>
        <div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fog-2">Объём</p><p className="mt-1 font-display text-xl font-bold text-concrete">{totals.volume > 0 ? `${totals.volume.toFixed(3)} м³` : "—"}</p></div>
        <div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fog-2">Стоимость</p><p className="mt-1 font-display text-xl font-bold text-heat">{totals.price > 0 ? `${totals.price.toLocaleString("ru-RU")} ₽` : "—"}</p></div>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="font-mono text-[10px] text-fog-2">Для точного расчёта — позвоните {COMPANY.phone}</p>{hasItems && <button onClick={() => setQtys({})} className="border border-steel px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-fog hover:border-heat hover:text-heat transition-colors duration-200">Очистить</button>}</div>
    </div>
  </div></div>);
}

function CartPage() {
  const cart = useCart();
  return (<div className="pt-[76px] lg:pt-[86px]"><div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
    <Bc items={[["Корзина"]]}/><h1 className="font-display text-3xl font-bold uppercase tracking-wide">Корзина</h1>
    {cart.items.length === 0 ? (
      <div className="mt-12 text-center"><p className="font-mono text-lg text-fog">Корзина пуста</p><Link to="/catalog" className="mt-4 inline-block border-2 border-heat bg-heat px-6 py-3 font-display text-sm font-bold uppercase tracking-[0.12em] text-coal hover:-translate-y-0.5">Перейти в каталог</Link></div>
    ) : (<>
      <div className="mt-8 space-y-3">{cart.items.map(item => (
        <div key={item.product.slug} className="flex items-center gap-4 border-2 border-steel bg-coal-2 p-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden border border-steel bg-coal-3 flex items-center justify-center">{item.product.image ? <img src={item.product.image} alt={item.product.name} className="h-full w-full object-contain p-1"/> : <span className="font-mono text-xl text-steel-2">?</span>}</div>
          <div className="min-w-0 flex-1"><Link to={`/product/${item.product.slug}`} className="font-display text-sm font-bold uppercase tracking-wide text-concrete hover:text-heat">{item.product.name}</Link><p className="mt-1 font-mono text-[10px] text-fog-2">{item.product.category}{item.product.manufacturer ? ` · ${item.product.manufacturer}` : ""}</p></div>
          <div className="flex items-center gap-2">
            <button onClick={() => cart.updateQty(item.product.slug, item.qty - 1)} className="grid h-8 w-8 place-items-center border border-steel text-fog hover:border-heat hover:text-heat">−</button>
            <span className="w-8 text-center font-mono text-sm text-concrete">{item.qty}</span>
            <button onClick={() => cart.updateQty(item.product.slug, item.qty + 1)} className="grid h-8 w-8 place-items-center border border-steel text-fog hover:border-heat hover:text-heat">+</button>
          </div>
          <button onClick={() => cart.remove(item.product.slug)} className="grid h-8 w-8 shrink-0 place-items-center border border-steel text-fog hover:border-red-500 hover:text-red-500">×</button>
        </div>
      ))}</div>
      <div className="mt-6 border-2 border-heat bg-coal-2 p-5">
        <div className="flex items-center justify-between"><p className="font-mono text-sm text-fog">Позиций: {cart.items.length}, всего: {cart.total} шт</p><button onClick={() => cart.clear()} className="border border-steel px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-fog hover:border-heat hover:text-heat">Очистить</button></div>
        <div className="mt-4 border-t border-steel pt-4"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-heat">Оформление заказа</p><p className="mt-2 font-mono text-sm text-fog">Для оформления заказа позвоните или отправьте заявку:</p><a href={COMPANY.phoneHref} className="mt-3 block font-display text-xl font-bold text-concrete">{COMPANY.phone}</a><a href={`mailto:${COMPANY.email}`} className="mt-1 block font-mono text-xs text-fog">{COMPANY.email}</a><a href={`mailto:${COMPANY.emailReserve}`} className="mt-0.5 block font-mono text-[10px] text-fog-2">{COMPANY.emailReserve}</a><p className="mt-2 font-mono text-[10px] text-fog-2">{COMPANY.officeHours}</p></div>
      </div>
    </>)}
  </div></div>);
}

function Bc({ items }: { items: [string, string?][] }) {
  return <nav className="mb-6 font-mono text-[11px] text-fog-2"><Link to="/" className="hover:text-concrete">Главная</Link>{items.map(([label, href], i) => <span key={i}><span className="mx-2 text-steel-2">→</span>{href ? <Link to={href} className="hover:text-concrete">{label}</Link> : <span className="text-fog">{label}</span>}</span>)}</nav>;
}

function NotFoundPage() {
  return (<div className="pt-[76px] lg:pt-[86px]"><div className="mx-auto max-w-[1400px] px-4 py-24 text-center sm:px-6"><h1 className="font-display text-6xl font-black text-heat">404</h1><p className="mt-4 font-mono text-lg text-fog">Страница не найдена</p><Link to="/" className="mt-6 inline-block border-2 border-heat bg-heat px-6 py-3.5 font-display text-sm font-bold uppercase tracking-[0.12em] text-coal hover:-translate-y-0.5">На главную</Link></div></div>);
}

export function KolormarketApp() {
  const [introSeen, setIntroSeen] = useState(false);
  const handleIntroDone = useCallback(() => { setIntroSeen(true); }, []);
  if (!introSeen) return <KolormarketIntro onDone={handleIntroDone}/>;
  return (
    <HashRouter><Shell><Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/catalog" element={<CatalogPage/>}/>
      <Route path="/catalog/:slug" element={<CategoryPage/>}/>
      <Route path="/product/:slug" element={<ProductPage/>}/>
      <Route path="/prices" element={<PricesPage/>}/>
      <Route path="/docs" element={<DocsPage/>}/>
      <Route path="/flexboard" element={<FlexboardPage/>}/>
      <Route path="/calculator" element={<CalculatorPage/>}/>
      <Route path="/faq" element={<FaqPage/>}/>
      <Route path="/about" element={<AboutPage/>}/>
      <Route path="/contacts" element={<ContactsPage/>}/>
      <Route path="/cart" element={<CartPage/>}/>
      <Route path="*" element={<NotFoundPage/>}/>
    </Routes></Shell></HashRouter>
  );
}
