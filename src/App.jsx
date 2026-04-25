import React, { useState, useEffect } from 'react'; 

// --- Валутен калкулатор (Точен курс: 1 EUR = 1.95583 BGN) ---
const formatPrice = (bgnPrice) => {
  const eurValue = bgnPrice / 1.95583;
  const eur = eurValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const bgn = bgnPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return { eur, bgn };
};

// --- Дефиниция на типовете проекти (глобално, за всички компоненти) ---
const projectTypes = [
  { val: 600, label: "Ландинг / Визитка", desc: "Едностраничен сайт (само 1 страница) за бърз старт. Без допълнителни страници." },
  { val: 900, label: "Многостраничен Сайт", desc: "Базово бизнес представяне (включва до 5 страници)." },
  { val: 3500, label: "Корпоративна Система", desc: "Сложна навигация, каталози, ревюта и интеграции." },
  { val: 6500, label: "Custom Софтуер", desc: "Индустриални платформи, бази данни и специфична логика." }
];

// --- Икони ---
const Icon = ({ name, className = "w-6 h-6" }) => {
  const icons = {
    bolt: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    check: <path d="M20 6L9 17l-5-5" />,
    users: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />,
    code: <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />,
    database: (
      <>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </>
    ),
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
    trending: (
      <>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
    calculator: (
      <>
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="16" y1="14" x2="16" y2="14.01" />
        <line x1="12" y1="14" x2="12" y2="14.01" />
        <line x1="8" y1="14" x2="8" y2="14.01" />
        <line x1="16" y1="10" x2="16" y2="10.01" />
        <line x1="12" y1="10" x2="12" y2="10.01" />
        <line x1="8" y1="10" x2="8" y2="10.01" />
        <line x1="16" y1="18" x2="16" y2="18.01" />
        <line x1="12" y1="18" x2="12" y2="18.01" />
        <line x1="8" y1="18" x2="8" y2="18.01" />
      </>
    ),
    x: <path d="M18 6L6 18M6 6l12 12" />,
    menu: <path d="M3 12h18M3 6h18M3 18h18" />,
    sparkles: (
      <>
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      </>
    ),
    loader: <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {icons[name]}
    </svg>
  );
};

// --- Gemini API Утилита ---
const callGeminiWithRetry = async (prompt, retries = 5) => {
  const apiKey = ""; // API key се предоставя от средата
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const delays = [1000, 2000, 4000, 8000, 16000];

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { 
            parts: [{ 
              text: "Ти си главен софтуерен архитект и бизнес консултант в елитната скандинавска уеб агенция 'Nordic Flow Engineering'. Даваш кратки, високопрофесионални и директни съвети на български език, фокусирани върху ROI, скорост и чист код. Форматирай отговора с кратки параграфи и булети." 
            }] 
          }
        })
      });
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Няма наличен отговор от сървъра.";
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, delays[i]));
    }
  }
};

// --- Компоненти ---

const Navbar = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tabs = [
    { id: 'home', label: 'Начало' },
    { id: 'calculator', label: 'Калкулатор & Услуги' },
    { id: 'portfolio', label: 'Доказателства' },
    { id: 'about', label: 'За Нас' },
    { id: 'faq', label: 'ЧЗВ' }
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 py-4">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabClick('home')}>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
            <Icon name="bolt" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900 hidden sm:block">NORDIC FLOW</span>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-bold uppercase tracking-widest text-slate-500">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`transition-colors hover:text-blue-600 ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : ''}`}
            >
              {tab.label}
            </button>
          ))}
          <button 
            onClick={() => handleTabClick('contact')}
            className="bg-slate-900 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition duration-300"
          >
            КОНСУЛТАЦИЯ
          </button>
        </div>

        {/* Mobile Nav Toggle */}
        <button className="lg:hidden text-slate-900" onClick={() => setIsOpen(!isOpen)}>
          <Icon name={isOpen ? "x" : "menu"} className="w-8 h-8" />
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 py-4 px-6 flex flex-col gap-4 shadow-xl">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`text-left text-sm font-bold uppercase tracking-widest ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-600'}`}
            >
              {tab.label}
            </button>
          ))}
          <button 
            onClick={() => handleTabClick('contact')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest mt-4"
          >
            Запази Консултация
          </button>
        </div>
      )}
    </nav>
  );
};

const HomeSection = ({ setActiveTab }) => {
  const { eur: maintEur, bgn: maintBgn } = formatPrice(0);
  const { eur: domainEur, bgn: domainBgn } = formatPrice(80);

  return (
    <div className="pt-24 animate-in fade-in duration-500">
      <section className="min-h-[85vh] flex flex-col justify-center max-w-7xl mx-auto px-6 border-b border-slate-100 py-20">
        <div className="max-w-4xl">
          {/* Removed headline as requested */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[0.9] mb-8 tracking-tighter">
            СКОРОСТ.<br/>СИГУРНОСТ.<br/><span className="text-slate-300">РЕЗУЛТАТИ.</span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-600 mb-12 max-w-2xl leading-relaxed">
            Имате нужда от сайт за бизнеса си? Ние създаваме ръчно написан код, без бавни платформи. Защо да харчите стотици левове месечно за масови системи, когато можете да имате силно инженерно решение, което лети?
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => setActiveTab('calculator')} className="bg-blue-600 text-white px-8 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-blue-700 transition duration-300 text-center">
              Изчисли точна цена
            </button>
          </div>
        </div>
      </section>

      {/* Техническо сравнение */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Масови платформи vs Инженерен Код</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Ние пишем чист код. Това означава минимална поддръжка, нулев риск от хакване на плъгини и 100/100 PageSpeed.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
            {/* WordPress / Mass CMS */}
            <div className="bg-white p-10 rounded-3xl border border-slate-200 opacity-70 flex flex-col h-full">
              <div className="text-red-500 font-black text-2xl mb-6 uppercase tracking-tighter border-b border-slate-100 pb-4 flex justify-between items-center gap-4">
                Масови Системи (CMS)
                <Icon name="x" className="w-10 h-10 text-red-500 shrink-0" />
              </div>
              <ul className="space-y-4 text-slate-600 flex-grow text-sm md:text-base">
                <li className="flex justify-between border-b border-slate-50 pb-2 gap-4">
                  <span className="shrink-0">PageSpeed</span> 
                  <span className="font-bold text-right">40-60 (Бавно)</span>
                </li>
                <li className="flex justify-between border-b border-slate-50 pb-2 gap-4">
                  <span className="shrink-0">Време за зареждане</span> 
                  <span className="font-bold text-right">3-7 секунди</span>
                </li>
                <li className="flex justify-between border-b border-slate-50 pb-2 items-center gap-4">
                  <span className="shrink-0">Месечна поддръжка</span> 
                  <span className="font-bold text-right leading-tight">~ 102.26 € / 200.00 лв.</span>
                </li>
                <li className="flex justify-between pb-2 gap-4">
                  <span className="shrink-0">Сигурност</span> 
                  <span className="font-bold text-right">Зависи от 40+ плъгина</span>
                </li>
              </ul>
            </div>
            {/* Nordic Flow HTML/React */}
            <div className="bg-slate-900 text-white p-10 rounded-3xl border border-blue-600 shadow-2xl scale-105 transform flex flex-col h-full">
              <div className="text-blue-400 font-black text-2xl mb-6 uppercase tracking-tighter border-b border-slate-800 pb-4 flex justify-between items-center gap-4">
                Nordic Flow
                <Icon name="check" className="w-10 h-10 text-blue-500 shrink-0" />
              </div>
              <ul className="space-y-4 text-slate-300 flex-grow text-sm md:text-base">
                <li className="flex justify-between border-b border-slate-800 pb-2 gap-4">
                  <span className="shrink-0">PageSpeed</span> 
                  <span className="font-bold text-green-400 text-right">95-100 (Светкавично)</span>
                </li>
                <li className="flex justify-between border-b border-slate-800 pb-2 gap-4">
                  <span className="shrink-0">Време за зареждане</span> 
                  <span className="font-bold text-white text-right">&lt; 1 секунда</span>
                </li>
                <li className="flex justify-between border-b border-slate-800 pb-2 items-center gap-4">
                  <span className="shrink-0">Поддръжка & Такси</span> 
                  <span className="font-bold text-white text-right leading-tight">
                    {maintEur} € / {maintBgn} лв.<br/>
                    <span className="text-[10px] text-blue-300 font-normal uppercase tracking-widest mt-1 inline-block">
                      ~{domainEur} € / {domainBgn} лв. на година за домейн<br/>
                      <span className="text-blue-400">Първа обработка на съдържание безплатно, всяка следваща: {formatPrice(150).eur} € / 150 лв.</span>
                    </span>
                  </span>
                </li>
                <li className="flex justify-between pb-2 gap-4">
                  <span className="shrink-0">Сигурност</span> 
                  <span className="font-bold text-white text-right">Без база данни за хакване</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};



const CalculatorSection = ({ setActiveTab, setProjectChoice, setContactMessage }) => {
  // Default to landing (600)
  const [siteType, setSiteType] = useState(600);
  const [pages, setPages] = useState(1);
  // Store previous pages value for restoring when switching away from landing
  const [prevPages, setPrevPages] = useState(5);
  const [seo, setSeo] = useState(false);
  const [calc, setCalc] = useState(false);
  const [copywriting, setCopywriting] = useState(false);
  const [multilang, setMultilang] = useState(false);
  const [langCount, setLangCount] = useState(1);
  const [langNames, setLangNames] = useState('');
  const [customIntegration, setCustomIntegration] = useState(false);

  // Конвертиране и форматиране
  const basePriceObj = formatPrice(siteType);
  // For landing, pages are always 1 and no extra page price
  const pagesPrice = (siteType !== 600 && pages > 5) ? (pages - 5) * 150 : 0;
  const pagesPriceObj = formatPrice(pagesPrice);

  const seoVal = seo ? 200 : 0;
  const seoObj = formatPrice(seoVal);

  const calcVal = calc ? 300 : 0;
  const calcObj = formatPrice(calcVal);

  const copyVal = copywriting ? 250 : 0;
  const copyObj = formatPrice(copyVal);

  // Езикова логика: 1 език (български) е включен, всеки следващ +200 лв
  let langVal = 0;
  if (multilang && langCount > 1) {
    langVal = (langCount - 1) * 200;
  }
  const langObj = formatPrice(langVal);

  // For landing, total is just 600 + extras (no extra pages)
  const totalBgn = parseInt(siteType) + pagesPrice + seoVal + calcVal + copyVal + langVal;
  const totalObj = formatPrice(totalBgn);

  // Тарифа за консултация
  const consultObj = formatPrice(80);

  const handleGetOffer = () => {
    let typeValue = "";
    if (siteType === 600) typeValue = "landing";
    else if (siteType === 900) typeValue = "multipage";
    else if (siteType === 3500) typeValue = "corporate";
    else if (siteType === 6500) typeValue = "custom";

    // Set the project label (not the code) for the contact form dropdown
    const projectLabel = projectTypes.find(t => t.val === siteType)?.label || '';
    setProjectChoice(projectLabel);

    let message = `--- Детайли от Калкулатора ---\n`;
    if (siteType !== 600) {
      message += `Брой страници: ${pages}\n`;
    }

    const activeServices = [];
    if (seo) activeServices.push("Локално SEO");
    if (calc) activeServices.push("JS Калкулатор / Логика");
    if (copywriting) activeServices.push("Професионален Копирайтинг");
    if (multilang) activeServices.push(`Многоезичен Сайт (${langCount} ез.: ${langNames || 'Не са посочени'})`);
    if (customIntegration) activeServices.push("Специфична Интеграция");

    if (activeServices.length > 0) {
      message += `Допълнителни услуги:\n- ${activeServices.join('\n- ')}\n`;
    }
    message += `Ориентировъчна цена: ${totalObj.eur} € / ${totalObj.bgn} лв.\n`;
    message += `\n⚡️ За да стартираме, се изисква 20% капаро. Останалата сума се плаща при завършване. Плащане чрез IBAN, Revolut или по договаряне.\n`;
    message += `-----------------------------\n\n`;

    setContactMessage(message);
    setActiveTab('contact');
  };

  return (
    <section className="pt-32 pb-24 max-w-7xl mx-auto px-6 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black uppercase tracking-tighter mb-4">Калкулатор & Услуги</h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">Изберете нужните функционалности и вижте точната си инвестиция на мига. Плащате еднократно.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto items-start">
        <div className="lg:col-span-2 space-y-10 bg-slate-50 p-8 md:p-12 rounded-[3rem] border border-slate-200 h-full flex flex-col">
          
          {/* Тип Сайт */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-slate-700 mb-4">Тип на проекта (4 Опции)</label>
            <div className="grid sm:grid-cols-2 gap-4">
              {projectTypes.map(t => {
                const priceFmt = formatPrice(t.val);
                return (
                  <div
                    key={t.val}
                    onClick={() => {
                      if (t.val === 600) {
                        setPrevPages(pages > 1 ? pages : prevPages); // Save current pages if >1
                        setPages(1);
                      } else {
                        setPages(prevPages > 1 ? prevPages : 5); // Restore previous or default to 5
                      }
                      setSiteType(t.val);
                    }}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col h-full ${siteType === t.val ? 'border-blue-600 bg-white shadow-lg' : 'border-slate-200 hover:border-blue-300 bg-white'}`}
                  >
                    <div className="font-black text-lg mb-1">{t.label}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase mb-3 flex-grow leading-relaxed">{t.desc}</div>
                    <div className="text-blue-600 font-bold whitespace-nowrap">{priceFmt.eur} € / {priceFmt.bgn} лв.</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Брой Страници */}
          {(siteType === 600) && (
            <div className="transition-opacity duration-300">
              <label className="flex justify-between text-sm font-bold uppercase tracking-widest text-slate-700 mb-4">
                <span>Брой индивидуални страници</span>
                <span className="text-blue-600">1 стр.</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={1}
                readOnly
                disabled
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none accent-blue-600 cursor-not-allowed opacity-70"
              />
              <p className="text-xs text-slate-500 mt-2 italic">*Ландинг страницата включва само 1 страница (Фиксирано).</p>
            </div>
          )}
          {(siteType !== 600 && siteType !== undefined) && (
            <div className="transition-opacity duration-300">
              <label className="flex justify-between text-sm font-bold uppercase tracking-widest text-slate-700 mb-4">
                <span>Брой индивидуални страници</span>
                <span className="text-blue-600">{`${pages} стр.`}</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={pages}
                onChange={e => setPages(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none accent-blue-600 cursor-pointer"
              />
              <p className="text-xs text-slate-500 mt-2 italic">*Първите 5 страници са включени в базовата цена. Всяка следваща е +150 лв.</p>
            </div>
          )}

          {/* Допълнителни услуги */}
          <div className="flex-grow">
            <label className="block text-sm font-bold uppercase tracking-widest text-slate-700 mb-4">Допълнителни Интеграции</label>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-blue-600 transition h-full">
                <input type="checkbox" checked={seo} onChange={() => setSeo(!seo)} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-600 mt-0.5 shrink-0" />
                <div className="flex-grow flex flex-col">
                  <div className="font-bold text-slate-900 text-sm">Локално SEO</div>
                  <div className="text-xs text-slate-500 mt-1 flex-grow">Multi-location за градове (Поморие, Бургас)</div>
                  <div className="font-bold text-slate-400 text-xs mt-2 whitespace-nowrap">+{formatPrice(200).eur} € / +{formatPrice(200).bgn} лв.</div>
                </div>
              </label>

              <label className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-blue-600 transition h-full">
                <input type="checkbox" checked={calc} onChange={() => setCalc(!calc)} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-600 mt-0.5 shrink-0" />
                <div className="flex-grow flex flex-col">
                  <div className="font-bold text-slate-900 text-sm">JS Калкулатор / Логика</div>
                  <div className="text-xs text-slate-500 mt-1 flex-grow">Интерактивни инструменти без база данни</div>
                  <div className="font-bold text-slate-400 text-xs mt-2 whitespace-nowrap">+{formatPrice(300).eur} € / +{formatPrice(300).bgn} лв.</div>
                </div>
              </label>

              <label className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-blue-600 transition h-full">
                <input type="checkbox" checked={copywriting} onChange={() => setCopywriting(!copywriting)} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-600 mt-0.5 shrink-0" />
                <div className="flex-grow flex flex-col">
                  <div className="font-bold text-slate-900 text-sm">Професионален Копирайтинг</div>
                  <div className="text-xs text-slate-500 mt-1 flex-grow">Ние пишем продаващите текстове за вас</div>
                  <div className="font-bold text-slate-400 text-xs mt-2 whitespace-nowrap">+{formatPrice(250).eur} € / +{formatPrice(250).bgn} лв.</div>
                </div>
              </label>


              {/* Специфична интеграция преди Многоезичен сайт */}
              <label className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-blue-600 transition h-full">
                <input type="checkbox" checked={customIntegration} onChange={() => setCustomIntegration(!customIntegration)} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-600 mt-0.5 shrink-0" />
                <div className="flex-grow flex flex-col">
                  <div className="font-bold text-slate-900 text-sm">Специфична Интеграция</div>
                  <div className="text-xs text-slate-500 mt-1 flex-grow">Допълнителни изисквания и функционалности</div>
                  <div className="font-bold text-slate-400 text-xs mt-2 whitespace-nowrap">По договаряне</div>
                </div>
              </label>

              <div className={`p-4 bg-white border ${multilang ? 'border-blue-600 shadow-md' : 'border-slate-200'} rounded-2xl transition flex flex-col h-full`}>
                <label className="flex items-start gap-4 cursor-pointer w-full">
                  <input type="checkbox" checked={multilang} onChange={() => setMultilang(!multilang)} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-600 mt-0.5 shrink-0" />
                  <div className="flex-grow flex flex-col">
                    <div className="font-bold text-slate-900 text-sm">Многоезичен Сайт</div>
                    <div className="text-xs text-slate-500 mt-1 flex-grow">Добавяне на чужди езици</div>
                    <div className="font-bold text-slate-400 text-xs mt-2 whitespace-nowrap">По договаряне</div>
                  </div>
                </label>
                
                {multilang && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3 animate-in fade-in duration-300 max-h-44 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 pr-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Брой езици</label>
                      <input 
                        type="number" 
                        min="1" max="10" 
                        value={langCount} 
                        onChange={(e) => setLangCount(Math.max(1, Math.min(10, Number(e.target.value))))} 
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition bg-slate-50" 
                      />
                      <span className="text-xs text-slate-400 mt-1 block">1 език (български) е включен в цената. Всеки следващ: +{formatPrice(200).eur} € / +{formatPrice(200).bgn} лв.</span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Кои езици (напр. EN, DE)?</label>
                      <input 
                        type="text" 
                        placeholder="Въведете езиците..." 
                        value={langNames} 
                        onChange={(e) => setLangNames(e.target.value)} 
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition bg-slate-50" 
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Резултат */}
        <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl flex flex-col lg:sticky lg:top-24 h-full lg:h-auto min-h-[500px]">
          <h3 className="text-2xl font-black uppercase tracking-tighter border-b border-slate-800 pb-6 mb-6">Вашата Инвестиция</h3>
          
          <div className="space-y-4 mb-8 flex-grow">
            <div className="flex justify-between text-slate-400 text-sm items-center gap-2">
              <span>Базова цена</span>
              <span className="text-white font-bold text-right whitespace-nowrap">{basePriceObj.eur} € <br/>{basePriceObj.bgn} лв.</span>
            </div>
            {pagesPrice > 0 && (
              <div className="flex justify-between text-slate-400 text-sm items-center gap-2">
                <span>Доп. страници ({pages - 5})</span>
                <span className="text-white font-bold text-right whitespace-nowrap">+{pagesPriceObj.eur} € <br/>+{pagesPriceObj.bgn} лв.</span>
              </div>
            )}
            {seo && (
              <div className="flex justify-between text-slate-400 text-sm items-center gap-2">
                <span>Локално SEO</span>
                <span className="text-white font-bold text-right whitespace-nowrap">+{seoObj.eur} € <br/>+{seoObj.bgn} лв.</span>
              </div>
            )}
            {calc && (
              <div className="flex justify-between text-slate-400 text-sm items-center gap-2">
                <span>JS Калкулатор</span>
                <span className="text-white font-bold text-right whitespace-nowrap">+{calcObj.eur} € <br/>+{calcObj.bgn} лв.</span>
              </div>
            )}
            {copywriting && (
              <div className="flex justify-between text-slate-400 text-sm items-center gap-2">
                <span>Копирайтинг</span>
                <span className="text-white font-bold text-right whitespace-nowrap">+{copyObj.eur} € <br/>+{copyObj.bgn} лв.</span>
              </div>
            )}
            {multilang && (
              <div className="flex justify-between text-slate-400 text-sm items-center gap-2">
                <span>Многоезичност ({langCount} ез.)</span>
                <span className="text-white font-bold text-right whitespace-nowrap">
                  {langCount > 1
                    ? `+${langObj.eur} € / +${langObj.bgn} лв.`
                    : 'Включено'}
                </span>
              </div>
            )}
            {customIntegration && (
              <div className="flex justify-between text-slate-400 text-sm items-center gap-2">
                <span>Специфична интеграция</span>
                <span className="text-white font-bold text-right whitespace-nowrap">По договаряне</span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-6 mb-8 mt-auto">
            <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">Еднократна сума</div>
            <div className="text-4xl lg:text-5xl font-black text-blue-500 leading-tight">
              {totalObj.eur} €
              <div className="text-2xl lg:text-3xl text-slate-400 font-bold mt-1">/ {totalObj.bgn} лв.</div>
            </div>
            <div className="mt-4 text-xs text-teal-400 font-bold bg-teal-400/10 inline-block px-3 py-2 rounded-lg leading-snug">
              Годишни разходи след това:<br/> ~{formatPrice(80).eur} € / {formatPrice(80).bgn} лв. (Домейн + Хост)<br/>
              <span className="text-blue-300">Първа обработка на съдържание безплатно, всяка следваща: {formatPrice(150).eur} € / 150 лв.</span>
            </div>
          </div>

          <button onClick={handleGetOffer} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-700 transition mt-auto shadow-lg shadow-blue-900/50">
            Вземи Оферта
          </button>
        </div>
      </div>

      {/* Consultation Banner */}
      <div className="mt-16 bg-blue-600 text-white rounded-[3rem] p-10 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex-grow">
          <div className="flex items-center gap-3 mb-4">
             <Icon name="users" className="w-8 h-8 text-blue-300" />
             <h3 className="text-3xl font-black uppercase tracking-tighter">Нужда от Консултация?</h3>
          </div>
          <p className="text-blue-100 max-w-2xl text-lg">Не сте сигурни какво ви трябва? Заявете технически одит, проектиране на архитектура или стратегия за автоматизация преди да инвестирате в разработка.</p>
          <div className="mt-4 inline-block bg-white/20 px-4 py-2 rounded-lg font-bold tracking-widest uppercase text-xs">Тарифа: {consultObj.eur} € / {consultObj.bgn} лв. на час</div>
        </div>
        <button onClick={() => { setProjectChoice('consultation'); setActiveTab('contact'); }} className="relative z-10 whitespace-nowrap bg-white text-blue-600 px-8 py-5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-100 transition shadow-xl shrink-0">
          Запази час
        </button>
      </div>
    </section>
  );
};

const PortfolioSection = () => (
  <section className="pt-32 pb-24 bg-slate-900 text-white animate-in fade-in duration-500">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-20">
        <h2 className="text-5xl font-black tracking-tighter mb-4">ТЕХНИЧЕСКИ SHOWCASE</h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">Как Nordic Flow изгражда силни проекти, които носят резултати. Без публичен CMS панел и с по-малко технически рискове.</p>
      </div>

      <div className="space-y-16">
        {/* Project 1: CERNO Multi-page Website */}
        <div className="grid md:grid-cols-2 gap-12 items-stretch border-b border-slate-800 pb-16">
          <a
            href="https://www.cernocaseclub.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-800 rounded-3xl aspect-[4/3] md:aspect-auto flex items-center justify-center border border-slate-700 relative overflow-hidden group h-full min-h-[300px] transition-transform hover:scale-105 focus:scale-105 outline-none"
            title="Виж сайта CERNO"
          >
            <img src="/CERNO.png" alt="CERNO Multi-page Website" className="object-contain w-full h-full rounded-3xl bg-white" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-slate-900/80 backdrop-blur p-4 rounded-xl text-xs font-mono text-green-400">
                &gt; Lighthouse: 100 / 100 / 100 / 100<br/>
                &gt; Status: Deployed
              </div>
            </div>
          </a>
          <div className="flex flex-col justify-center">
            <h3 className="text-3xl font-black mb-2 text-blue-400">CERNO Multi-page Website</h3>
            <p className="text-slate-300 mb-6 italic">Финландия • Многостраничен бизнес сайт</p>
            <p className="text-slate-400 mb-8 leading-relaxed flex-grow">
              CERNO показва силата на многостраничния уебсайт: представяне на услуги, екип, събития и контакти в отделни секции. Всеки раздел е оптимизиран за Google и UX, което води до повече запитвания и по-добро доверие от клиенти.<br/><br/>
              <span className="font-bold text-blue-500">Резултат:</span> Повече клиенти, по-добра репутация и лесна навигация за всеки посетител.
            </p>
            <ul className="space-y-3 font-mono text-sm text-slate-300">
              <li><span className="text-blue-500">✓</span> Многостранична архитектура</li>
              <li><span className="text-blue-500">✓</span> SEO за всяка страница</li>
              <li><span className="text-blue-500">✓</span> Модерен бизнес имидж</li>
            </ul>
          </div>
        </div>

        {/* Project 2: Tuthon Landing Page */}
        <div className="grid md:grid-cols-2 gap-12 items-stretch border-b border-slate-800 pb-16">
          <div className="order-2 md:order-1 flex flex-col justify-center">
            <h3 className="text-3xl font-black mb-2 text-blue-400">Tuthon Landing Page</h3>
            <p className="text-slate-300 mb-6 italic">България • Ландинг страница за апартамент, портфолио, ресторант и др.</p>
            <p className="text-slate-400 mb-8 leading-relaxed flex-grow">
              Tuthon е универсална ландинг страница, която може да се използва за представяне на апартамент под наем, лично портфолио, ресторант, малък бизнес или всякакъв друг проект. Модерен дизайн, адаптивност и възможност за персонализация според нуждите на клиента.<br/><br/>
              <span className="font-bold text-blue-500">Резултат:</span> Впечатляващо първо впечатление, повече запитвания и лесна промяна на съдържанието според целта.
            </p>
            <ul className="space-y-3 font-mono text-sm text-slate-300">
              <li><span className="text-blue-500">✓</span> Модерен ландинг дизайн</li>
              <li><span className="text-blue-500">✓</span> Гъвкава употреба (апартамент, портфолио, ресторант)</li>
              <li><span className="text-blue-500">✓</span> Лесна персонализация</li>
            </ul>
          </div>
          <a
            href="http://bg-holiday.fi/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-800 rounded-3xl aspect-[4/3] md:aspect-auto flex items-center justify-center border border-slate-700 relative overflow-hidden order-1 md:order-2 group h-full min-h-[300px] transition-transform hover:scale-105 focus:scale-105 outline-none"
            title="Виж сайта Tuthon"
          >
            <img src="/tuthon.png" alt="Tuthon Landing Page" className="object-contain w-full h-full rounded-3xl bg-white" />
          </a>
        </div>
      </div>
      
      {/* <div className="text-center mt-12">
        <p className="text-slate-500 italic">"HTML сайтове без WordPress = минимална рутинна поддръжка и по-малък риск."</p>
      </div> */}
    </div>
  </section>
);

const AboutSection = () => (
  <section className="pt-32 pb-24 max-w-7xl mx-auto px-6 animate-in fade-in duration-500">
    <div className="grid lg:grid-cols-2 gap-20 items-stretch">
        <div className="flex flex-col h-full justify-between">
            <div>
                <h2 className="text-5xl lg:text-6xl font-black mb-10 tracking-tighter uppercase">Историята зад<br/>Nordic Flow.</h2>
                <p className="text-xl text-slate-600 leading-relaxed mb-6">
                  <strong>"Необходимостта е майка на изобретението."</strong> <br></br>За мен, изграждането на бързи и надеждни уебсайтове не беше просто избор - беше бизнес необходимост.
                </p>
                <p className="text-lg text-slate-500 leading-relaxed mb-8">
                  Завършил съм бакалавър в софтуерната индустрия и започвам магистратура. Имам опит в три различни компании, включително и в Китай. Вярвам, че сложните и бавни системи убиват бизнеса.
                  <br/><br/>
                  Когато се върнах в Поморие, видях как сезонните бизнеси губят клиенти заради бавни сайтове, претъпкани с излишни WordPress плъгини. Туристите нямат търпение да чакат 5 секунди да зареди менюто ви на плажа. Те искат информацията веднага.
                </p>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-2xl">
              <h4 className="font-bold text-slate-900 mb-2">Моето прозрение:</h4>
              <p className="text-slate-600 text-sm italic">
                Ако бизнесът ви зависи от туристи и спешни обаждания през лятото, производителността на вашия сайт е най-важният ви служител. Не го крийте зад бавен CMS. Направете го чист, сигурен и го накарайте да лети.
              </p>
            </div>

        </div>
        <div className="bg-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center p-8 md:p-10 text-slate-900 overflow-hidden relative border border-slate-200 max-w-xl mx-auto shadow-md">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-slate-200/80 pointer-events-none select-none"></div>
          <div className="relative z-10 flex flex-col items-center text-center w-full">
            <h3 className="text-3xl font-black mb-8 uppercase">Нашите Ценности</h3>
            <ul className="space-y-6 w-full">
              <li className="flex flex-col items-center gap-2">
                <div className="bg-blue-600/10 p-2 rounded-xl mb-2"><Icon name="bolt" className="text-blue-600 w-5 h-5" /></div> 
                <div>
                  <div className="font-black text-lg leading-tight mb-1">Скорост над всичко</div>
                  <div className="text-slate-600 text-sm">Милисекундите носят пари. Ние правим така, че сайтът ви да се отваря мигновено на всеки телефон.</div>
                </div>
              </li>
              <li className="flex flex-col items-center gap-2">
                <div className="bg-blue-600/10 p-2 rounded-xl mb-2"><Icon name="code" className="text-blue-600 w-5 h-5" /></div> 
                <div>
                  <div className="font-black text-lg leading-tight mb-1">Простотата е сила</div>
                  <div className="text-slate-600 text-sm">Колкото по-прост и изчистен е кодът, толкова по-надежден и сигурен е вашият дигитален актив.</div>
                </div>
              </li>
              <li className="flex flex-col items-center gap-2">
                <div className="bg-blue-600/10 p-2 rounded-xl mb-2"><Icon name="check" className="text-blue-600 w-5 h-5" /></div> 
                <div>
                  <div className="font-black text-lg leading-tight mb-1">Прозрачни цени</div>
                  <div className="text-slate-600 text-sm">Плащате еднократна такса за инженерния ни труд, без скрити месечни абонаменти или уловки.</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
    </div>
  </section>
);

const FAQSection = () => (
  <section className="pt-32 pb-24 bg-slate-50 animate-in fade-in duration-500">
    <div className="max-w-4xl mx-auto px-6">
      <h2 className="text-5xl font-black mb-16 tracking-tighter text-center uppercase">Често Задавани Въпроси</h2>
      <div className="space-y-4">
        {[
          { q: "Защо HTML сайтовете са по-бързи от WordPress?", a: "HTML сайтовете нямат база данни, няма PHP обработка, няма плъгини, които да зареждат допълнителен код. Всяка страница е статичен файл, който браузърът зарежда директно. Резултат: под 1 секунда зареждане срещу 3-7 секунди при WordPress." },
          { q: "Мога ли да актуализирам съдържанието сам?", a: "Да. При предаване получавате пълна документация. Ако не искате да се занимавате с код, ние предлагаме управлявани съдържателни ъпдейти в рамките на 24 часа." },
          { q: "Колко време отнема изработката?", a: "Визитка (до 3 стр.): 5-7 работни дни. Корпоративен сайт (до 10 стр.): 10-14 работни дни. Custom проект: по договаряне. Значително по-бързо от масовите агенции." },
          { q: "Какво се случва ако сайтът бъде хакнат?", a: "При статичен код рискът е практически нулев: няма публичен CMS панел, няма плъгини и няма runtime база данни. Това е ключова причина много бизнеси да избират този модел." },
          { q: "Защо не предлагате онлайн магазини (E-commerce)?", a: "Фокусираме се върху перфектни статични сайтове и корпоративни презентации. Пълните магазини изискват сложен backend, което е извън модела за 'минимална поддръжка'. Вместо това предлагаме бързи продуктови каталози." }
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
            <h4 className="text-lg font-black uppercase tracking-tight mb-4 flex items-start gap-3">
              <Icon name="help" className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" /> 
              {item.q}
            </h4>
            <p className="text-slate-600 leading-relaxed flex-grow">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ContactSection = ({ projectChoice, setProjectChoice, contactMessage, setContactMessage }) => {

  return (
    <section className="pt-32 pb-32 max-w-7xl mx-auto px-6 animate-in fade-in duration-500">
      <div className="bg-slate-900 rounded-[4rem] p-10 md:p-20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 max-w-5xl mx-auto grid md:grid-cols-2 gap-20 items-stretch">
              <div className="flex flex-col justify-center">
                  <h2 className="text-5xl md:text-7xl font-black leading-[0.9] mb-8 tracking-tighter uppercase">
                      Готов за<br/><span className="text-blue-500">бърз сайт?</span>
                  </h2>
                  <p className="text-xl text-slate-400 mb-12 flex-grow">
                      Ако искаш сайт, който зарежда под 1 секунда и се представя силно в Google, а не тежка инсталация с постоянна поддръжка,  свържи се с нас.
                  </p>
                  <div className="space-y-6 border-l-2 border-blue-600 pl-6 mt-auto">
                      <div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Email</div>
                        <div className="text-xl font-bold">nordicflow.dev@gmail.com</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Обслужваме</div>
                        <div className="text-lg text-slate-300">Бургаски Регион и България</div>
                      </div>
                  </div>
              </div>
              
              <div className="bg-white/5 p-8 md:p-10 rounded-3xl backdrop-blur-sm border border-white/10 flex flex-col h-full">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-6">Запази Проект</h3>
                <form
                  className="space-y-5 flex flex-col flex-grow"
                  onSubmit={e => {
                    e.preventDefault();
                    const name = e.target.elements['name']?.value || '';
                    const email = e.target.elements['email']?.value || '';
                    const project = projectChoice;
                    const info = contactMessage;
                    const subject = encodeURIComponent('Запитване от сайта Nordic Flow');
                    const body = encodeURIComponent(
                      `Име/Бизнес: ${name}\nEmail: ${email}\nПроект: ${project}\n\n${info}`
                    );
                    window.location.href = `mailto:nordicflow.dev@gmail.com?subject=${subject}&body=${body}`;
                  }}
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Име / Бизнес</label>
                    <input name="name" type="text" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4 focus:border-blue-500 outline-none transition text-white" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email</label>
                    <input name="email" type="email" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4 focus:border-blue-500 outline-none transition text-white" required />
                  </div>
                  {/* Падащо меню за избор на проект */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">От какво имате нужда?</label>
                    <div className="relative">
                      <select 
                        value={projectChoice}
                        onChange={e => setProjectChoice(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4 focus:border-blue-500 outline-none transition text-white appearance-none">
                        <option value="" disabled hidden>Изберете опция...</option>
                        {projectTypes.map((type, idx) => (
                          <option key={type.label} value={type.label}>{type.label}</option>
                        ))}
                        <option value="consultation">Професионална Консултация</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        ▼
                      </div>
                    </div>
                  </div>
                  <div className="flex-grow flex flex-col">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Допълнителна информация (по желание)</label>
                    <textarea 
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Опишете накратко вашия бизнес или идея..." 
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4 min-h-[100px] focus:border-blue-500 outline-none transition text-white resize-none flex-grow"
                      name="info"
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white px-8 py-5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-500 transition duration-300 mt-auto shadow-lg shadow-blue-900/50">
                    Изпрати към nordicflow.dev@gmail.com
                  </button>
                </form>
              </div>
          </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="py-12 border-t border-slate-100 bg-white">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-[10px]">
          <Icon name="bolt" className="w-4 h-4" />
        </div>
        <span className="font-black text-slate-900 tracking-tighter">NORDIC FLOW</span>
      </div>
      
      <div className="text-center md:text-left">
        <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
          © 2026 Nordic Flow Engineering.
        </div>
        <div className="text-slate-500 text-xs">
          Създадено без никакъв WordPress. Създадено с чист код и инженерна прецизност.
        </div>
      </div>
      
      <div className="flex gap-4 text-slate-400">
        <span className="text-xs font-bold uppercase">Бургаски регион</span>
        <span className="text-xs font-bold uppercase border-l border-slate-300 pl-4">Работим дистанционно</span>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [projectChoice, setProjectChoice] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Auto-fill contactMessage with projectChoice if switching to contact and textarea is empty
    if (activeTab === 'contact' && !contactMessage && projectChoice) {
      setContactMessage(`Избран проект: ${projectChoice}`);
    }
  }, [activeTab, contactMessage, projectChoice]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main>
        {activeTab === 'home' && <HomeSection setActiveTab={setActiveTab} />}
        {activeTab === 'calculator' && <CalculatorSection setActiveTab={setActiveTab} setProjectChoice={setProjectChoice} setContactMessage={setContactMessage} />}
        {activeTab === 'portfolio' && <PortfolioSection />}
        {activeTab === 'about' && <AboutSection />}
        {activeTab === 'faq' && <FAQSection />}
        {activeTab === 'contact' && <ContactSection projectChoice={projectChoice} setProjectChoice={setProjectChoice} contactMessage={contactMessage} setContactMessage={setContactMessage} />}
      </main>

      <Footer />
    </div>
  );
}
