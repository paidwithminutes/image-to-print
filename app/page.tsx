'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/* ─── REDBUBBLE PRODUCT SPECS ─── */
const PRODUCTS = [
  { id: 'tshirt',    label: 'T-Shirt',        emoji: '👕', w: 2875, h: 3900, desc: 'Premium Unisex Tee',    fit: 'pad'   },
  { id: 'sticker',   label: 'Sticker',         emoji: '🔵', w: 2800, h: 2800, desc: 'All Sticker Sizes',    fit: 'pad'   },
  { id: 'phonecase', label: 'Phone Case',      emoji: '📱', w: 1187, h: 1852, desc: 'Standard Cases',       fit: 'pad'   },
  { id: 'poster',    label: 'Poster',          emoji: '🖼️',  w: 6000, h: 8000, desc: 'All Poster Sizes',    fit: 'pad'   },
  { id: 'square',    label: 'Hats & Blocks',   emoji: '🎩', w: 8000, h: 8000, desc: 'Acrylic, Hats, Pins',  fit: 'pad'   },
  { id: 'pattern',   label: 'Pattern / AOP',   emoji: '🌀', w: 5000, h: 5000, desc: 'All-Over Print',        fit: 'pad'   },
  { id: 'duvet',     label: 'Duvet Cover',     emoji: '🛏️',  w: 7632, h: 6480, desc: 'King Size Max',        fit: 'pad'   },
  { id: 'banner',    label: 'Shop Banner',     emoji: '🏷️',  w: 2400, h: 600,  desc: 'Profile Cover',         fit: 'pad'   },
  { id: 'totebag',   label: 'Tote Bag',        emoji: '👜', w: 2000, h: 2000, desc: 'Standard Tote',         fit: 'pad'   },
  { id: 'mug',       label: 'Mug',             emoji: '☕', w: 3200, h: 2000, desc: '11oz & 15oz Mug',        fit: 'pad'   },
  { id: 'laptop',    label: 'Laptop Sleeve',   emoji: '💻', w: 3500, h: 2500, desc: '13" & 15" Sleeves',     fit: 'pad'   },
  { id: 'notebook',  label: 'Spiral Notebook', emoji: '📓', w: 2400, h: 3200, desc: 'A5 & A4 Notebooks',     fit: 'pad'   },
];

const ORB_CONFIG = [
  { cls: 'orb-lg orb-r1', emoji: '🔴', label: 'Resize',   style: { top: '8%',  left: '-8%'   }, anim: 0 },
  { cls: 'orb-md orb-r2', emoji: '👕', label: 'T-Shirt',  style: { top: '28%', left: '-13%'  }, anim: 1 },
  { cls: 'orb-sm orb-r3', emoji: '🔵', label: 'Sticker',  style: { top: '52%', left: '-7%'   }, anim: 2 },
  { cls: 'orb-md orb-r4', emoji: '🖼️',  label: 'Poster',   style: { top: '72%', left: '-11%'  }, anim: 3 },
  { cls: 'orb-sm orb-r5', emoji: '📱', label: 'Case',     style: { top: '90%', left: '4%'    }, anim: 4 },
  { cls: 'orb-lg orb-r6', emoji: '💾', label: 'Download', style: { top: '5%',  right: '-8%'  }, anim: 5 },
  { cls: 'orb-md orb-r7', emoji: '🎨', label: 'Design',   style: { top: '26%', right: '-13%' }, anim: 6 },
  { cls: 'orb-sm orb-r8', emoji: '✂️',  label: 'Crop',     style: { top: '50%', right: '-7%'  }, anim: 7 },
  { cls: 'orb-md orb-r9', emoji: '📐', label: 'Scale',    style: { top: '72%', right: '-12%' }, anim: 8 },
  { cls: 'orb-sm orb-r0', emoji: '🛍️',  label: 'POD',      style: { top: '91%', right: '3%'   }, anim: 9 },
];

const FLOAT_ANIMS = ['float0','float1','float2','float3','float4','float5','float6','float7','float8','float9'];
const SCATTER_OFFSETS = [[-55,-40],[-70,20],[-45,60],[30,-65],[65,-30],[55,45],[70,-20],[40,65],[-30,55],[-60,30]];

/* ─── BUBBLE CANVAS ─── */
function BubbleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const COLORS = [
      ['#ff6666','#cc0000'],['#ff0000','#880000'],['#ff4444','#991111'],
      ['#ff2222','#aa0000'],['#ff8888','#dd1111'],['#ff3333','#bb0000'],
      ['#ff5555','#cc2200'],['#ff1111','#990000'],['#ff7777','#dd0000'],['#ff4400','#cc0000'],
    ];
    let W: number, H: number;
    type Bubble = { x:number;y:number;r:number;vx:number;vy:number;c0:string;c1:string;opacity:number;wobble:number;wobbleSpeed:number };
    let bubbles: Bubble[] = [];
    let rafId: number;
    let alive = true;

    function resize() { W = canvas!.width = canvas!.offsetWidth; H = canvas!.height = canvas!.offsetHeight; }
    function makeBubble(): Bubble {
      const s = 12 + Math.random() * (W < 600 ? 28 : 55);
      const c = COLORS[Math.floor(Math.random() * COLORS.length)];
      return { x:Math.random()*W, y:H+s, r:s, vx:(Math.random()-0.5)*0.6, vy:-(0.4+Math.random()*0.8), c0:c[0], c1:c[1], opacity:(W<600?0.35:0.55)+Math.random()*(W<600?0.2:0.3), wobble:Math.random()*Math.PI*2, wobbleSpeed:0.02+Math.random()*0.02 };
    }
    function init() {
      resize(); bubbles = [];
      for (let i=0; i<(W<600?10:22); i++) { const b=makeBubble(); b.y=Math.random()*H; bubbles.push(b); }
    }
    function draw() {
      if (!alive) return;
      ctx.clearRect(0,0,W,H);
      for (const b of bubbles) {
        b.wobble+=b.wobbleSpeed; b.x+=b.vx+Math.sin(b.wobble)*0.4; b.y+=b.vy;
        if (b.y < -b.r*2) Object.assign(b, makeBubble());
        const g = ctx.createRadialGradient(b.x-b.r*0.3,b.y-b.r*0.3,b.r*0.1,b.x,b.y,b.r);
        g.addColorStop(0,b.c0); g.addColorStop(1,b.c1);
        ctx.save(); ctx.globalAlpha=b.opacity;
        ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
        const gl = ctx.createRadialGradient(b.x-b.r*0.3,b.y-b.r*0.4,0,b.x-b.r*0.3,b.y-b.r*0.4,b.r*0.55);
        gl.addColorStop(0,'rgba(255,255,255,0.5)'); gl.addColorStop(1,'rgba(255,255,255,0)');
        ctx.globalAlpha=b.opacity*0.6; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fillStyle=gl; ctx.fill();
        ctx.restore();
      }
      rafId = requestAnimationFrame(draw);
    }
    window.addEventListener('resize', resize);
    init(); draw();
    return () => { alive=false; cancelAnimationFrame(rafId); window.removeEventListener('resize',resize); };
  }, []);
  return <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}} />;
}

/* ─── ORB FIELD ─── */
function OrbField() {
  const [scattered, setScattered] = useState<number|null>(null);
  const scatteringRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>|null>(null);
  const handleEnter = useCallback((i:number) => {
    if (scatteringRef.current) return;
    scatteringRef.current = true; setScattered(i);
  }, []);
  const handleLeave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { setScattered(null); scatteringRef.current=false; }, 450);
  }, []);
  return (
    <div className="orb-field">
      {ORB_CONFIG.map((orb,i) => {
        const isHov=scattered===i, isOth=scattered!==null&&!isHov;
        const [dx,dy]=SCATTER_OFFSETS[i%10];
        const dur=3.5+(i%5)*0.6, delay=-(i*0.7);
        return (
          <div key={i} className={`orb ${orb.cls}`}
            style={{...orb.style as React.CSSProperties,
              animation:scattered===null?`${FLOAT_ANIMS[orb.anim]} ${dur}s ${delay}s ease-in-out infinite`:'none',
              transform:isHov?'scale(1.22) translateY(-8px)':isOth?`translate(${dx}px,${dy}px) scale(0.82)`:undefined,
              filter:isOth?'blur(1.5px)':'none', opacity:isOth?0.55:1, zIndex:isHov?10:1,
            }}
            onMouseEnter={()=>handleEnter(i)} onMouseLeave={handleLeave}>
            <div className="orb-inner">
              <span className="orb-emoji">{orb.emoji}</span>
              <span className="orb-label">{orb.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── TOAST ─── */
function showToast(msg: string) {
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style,{position:'fixed',bottom:'32px',left:'50%',transform:'translateX(-50%) translateY(20px)',background:'#111',color:'#fff',padding:'12px 24px',borderRadius:'50px',fontSize:'14px',fontWeight:'800',fontFamily:"'Nunito',sans-serif",zIndex:'9999',boxShadow:'0 4px 20px rgba(0,0,0,0.4)',opacity:'0',transition:'all 0.3s',border:'1px solid rgba(255,255,255,0.1)'});
  document.body.appendChild(t);
  setTimeout(()=>{t.style.opacity='1';t.style.transform='translateX(-50%) translateY(0)';},50);
  setTimeout(()=>{t.style.opacity='0';t.style.transform='translateX(-50%) translateY(10px)';setTimeout(()=>t.remove(),300);},3000);
}

/* ─── TOOL CARD ─── */
function ToolCard() {
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const [image, setImage] = useState<string|null>(null);
  const [fileName, setFileName] = useState('');
  const [isDrag, setIsDrag] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [outputUrl, setOutputUrl] = useState<string|null>(null);
  const [outputName, setOutputName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedProduct = PRODUCTS.find(p => p.id === selectedId) ?? null;

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { setError('Please upload a JPG or PNG image.'); return; }
    setError(''); setOutputUrl(null); setOutputName('');
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setIsDrag(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }

  function processImage() {
    if (!image || !selectedProduct) return;
    setProcessing(true); setError(''); setOutputUrl(null);
    const img = new Image();
    img.onload = () => {
      const { w, h, fit, id } = selectedProduct;
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      const srcAspect = img.naturalWidth / img.naturalHeight;
      const dstAspect = w / h;
      let drawW: number, drawH: number, dx: number, dy: number;
      if (fit === 'cover') {
        if (srcAspect > dstAspect) { drawH=h; drawW=h*srcAspect; }
        else { drawW=w; drawH=w/srcAspect; }
      } else {
        if (srcAspect > dstAspect) { drawW=w; drawH=w/srcAspect; }
        else { drawH=h; drawW=h*srcAspect; }
      }
      dx = (w-drawW)/2; dy = (h-drawH)/2;
      ctx.drawImage(img, dx, dy, drawW, drawH);
      const baseName = fileName.replace(/\.[^/.]+$/, '');
      const outName = `${baseName}_${id}_${w}x${h}.png`;
      setOutputName(outName);
      setOutputUrl(canvas.toDataURL('image/png'));
      setProcessing(false);
      showToast('✓ Resized! Ready to download.');
    };
    img.onerror = () => { setError('Could not load image. Try another file.'); setProcessing(false); };
    img.src = image;
  }

  return (
    <div className="tool-card">
      <div className="t-app">

        {/* Header */}
        <div className="t-header">
          <div className="t-header-top">
            <div className="t-logo">Red<em>Resizer</em></div>
            <div className="t-badge">RedBubble Resizer</div>
          </div>
          <div className="t-sub">Perfect dimensions for every RedBubble product — instantly</div>
        </div>

        {/* Step 1 */}
        <div className="t-section">
          <div className="t-label">① Pick Your Product</div>
          <div className="product-grid">
            {PRODUCTS.map(p => (
              <button key={p.id}
                className={`product-btn${selectedId===p.id?' active':''}`}
                onClick={()=>{ setSelectedId(p.id); setOutputUrl(null); setError(''); }}>
                <span className="product-emoji">{p.emoji}</span>
                <span className="product-name">{p.label}</span>
                <span className="product-size">{p.w}×{p.h}</span>
              </button>
            ))}
          </div>
          {selectedProduct && (
            <div className="product-spec-bar">
              <span>📐 {selectedProduct.w} × {selectedProduct.h} px</span>
              <span className="spec-dot">·</span>
              <span>{selectedProduct.desc}</span>
              <span className="spec-dot">·</span>
              <span>⬜ Artwork fully preserved</span>
            </div>
          )}
        </div>

        {/* Step 2 */}
        <div className="t-section">
          <div className="t-label">② Upload Your Image</div>
          {image ? (
            <div className="preview-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="Preview" className="preview-img" />
              <button className="preview-clear" onClick={()=>{ setImage(null); setFileName(''); setOutputUrl(null); }}>✕</button>
              <div className="preview-name">📎 {fileName}</div>
            </div>
          ) : (
            <div className={`upload-area${isDrag?' drag-over':''}`}
              onDragOver={e=>{e.preventDefault();setIsDrag(true);}}
              onDragLeave={()=>setIsDrag(false)}
              onDrop={handleDrop}
              onClick={()=>fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                style={{display:'none'}} onChange={e=>{if(e.target.files?.[0])handleFile(e.target.files[0]);}} />
              <div className="upload-icon">🖼️</div>
              <div className="upload-title">Drop your image here</div>
              <div className="upload-sub">JPG or PNG · Click to browse</div>
            </div>
          )}
        </div>

        {/* Step 3 */}
        <div className="t-gen-wrap">
          <button className="t-gen-btn" disabled={!image||!selectedProduct||processing} onClick={processImage}>
            {processing
              ? <><span className="t-dot-spin"/><span>Resizing…</span></>
              : <><span>🖨️</span><span>Resize for {selectedProduct?selectedProduct.label:'Product'}</span></>}
          </button>
        </div>

        {error && <div className="t-error">{error}</div>}

        {/* Output */}
        {outputUrl && selectedProduct && (
          <div className="output-section">
            <div className="output-preview-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={outputUrl} alt="Resized" className="output-preview-img" />
              <div className="output-badge">✓ {selectedProduct.w}×{selectedProduct.h}px</div>
            </div>
            <a className="download-btn" href={outputUrl} download={outputName}>⬇️ Download PNG</a>
            <div className="output-hint">Ready to upload to RedBubble · PNG · {selectedProduct.w}×{selectedProduct.h}px</div>
          </div>
        )}

        {/* Empty state */}
        {!image && !outputUrl && (
          <div className="t-empty">
            <div className="t-empty-icon">🎨</div>
            <div className="t-empty-title">Pick a product, drop an image</div>
            <div className="t-empty-sub">Your perfectly sized PNG will be ready to download in seconds</div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ─── PAGE ─── */
export default function Home() {
  return (
    <>
      <div className="bg-layer" />
      <div className="bg-dots" />
      <div className="site-wrap">

        {/* NAV */}
        <nav>
          <a className="nav-logo" href="#">Red<span>Resizer</span></a>
          <a className="nav-cta" href="#tool">Resize Free ⚡</a>
        </nav>

        {/* HERO */}
        <section className="hero">
          <BubbleCanvas />
          <div className="hero-content">
            <div className="hero-badge"><div className="dot"/>RedBubble · Print on Demand</div>
            <h1 className="hero-title">
              Upload Once.<br/>
              Sized <span className="red">Perfect.</span><br/>
              <span className="outline">Every Product.</span>
            </h1>
            <p className="hero-sub">
              Stop guessing pixel dimensions. Pick your <strong>RedBubble product</strong>, drop your image — RedResizer resizes it perfectly. One click, ready to upload.
            </p>
            <div className="hero-btns">
              <a className="btn-primary" href="#tool">⚡ Resize Free — No signup</a>
              <a className="btn-secondary" href="#how">How it works →</a>
            </div>
          </div>
          <div className="scroll-hint">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            scroll
          </div>
        </section>

        {/* FEATURES STRIP */}
        <div className="features-strip">
          <div className="feat-item"><span className="icon">🎯</span>12 RB Products</div>
          <div className="feat-item"><span className="icon">⚡</span>Instant Resize</div>
          <div className="feat-item"><span className="icon">💾</span>PNG Download</div>
          <div className="feat-item"><span className="icon">🆓</span>100% Free · No Signup</div>
        </div>

        {/* TOOL */}
        <section className="tool-section" id="tool">
          <div className="section-label-wrap">
            <div className="section-eyebrow">The Tool</div>
            <h2 className="section-title">Your RedBubble <span>Resizer</span></h2>
          </div>
          <div className="tool-zone">
            <OrbField />
            <ToolCard />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how-section" id="how">
          <div className="section-label-wrap">
            <div className="section-eyebrow">Simple as 1-2-3</div>
            <h2 className="section-title">How <span>RedResizer</span> Works</h2>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num-big">01</div>
              <div className="step-card-title">Pick Your Product</div>
              <div className="step-card-desc">Choose from 12 RedBubble products — T-shirts, stickers, phone cases, posters, duvet covers, and more. Exact specs baked in, always up to date.</div>
            </div>
            <div className="step-card">
              <div className="step-num-big">02</div>
              <div className="step-card-title">Drop Your Image</div>
              <div className="step-card-desc">Upload your JPG or PNG. RedResizer resizes and centers it to RedBubble&apos;s exact pixel dimensions — 100% in your browser, nothing uploaded to a server.</div>
            </div>
            <div className="step-card">
              <div className="step-num-big">03</div>
              <div className="step-card-title">Download &amp; Upload</div>
              <div className="step-card-desc">Hit download. Your perfectly sized PNG is ready to go straight into RedBubble. No Photoshop, no guessing, no rejected uploads.</div>
            </div>
          </div>
        </section>

        {/* PRODUCTS COVERED */}
        <section className="pricing-section" id="products">
          <div className="section-label-wrap">
            <div className="section-eyebrow">Supported Products</div>
            <h2 className="section-title">Every <span>Format</span> Covered</h2>
          </div>
          <div className="pricing-cards">
            {([
              { name:'Apparel',     emoji:'👕', items:['T-Shirt — 2875×3900','Hats & Blocks — 8000×8000','All-Over Print — 5000×5000'] },
              { name:'Accessories', emoji:'📱', items:['Phone Case — 1187×1852','Tote Bag — 2000×2000','Sticker — 2800×2800'] },
              { name:'Home & Wall', emoji:'🖼️',  items:['Poster — 6000×8000','Duvet Cover — 7632×6480','Mug — 3200×2000'] },
              { name:'Stationery',  emoji:'📓', items:['Notebook — 2400×3200','Laptop Sleeve — 3500×2500','Shop Banner — 2400×600'] },
            ] as {name:string;emoji:string;items:string[]}[]).map(cat => (
              <div className="pricing-card" key={cat.name}>
                <div className="pc-name">{cat.emoji} {cat.name}</div>
                <div className="pc-perks" style={{marginTop:16}}>
                  {cat.items.map(item=><div className="pc-perk" key={item}>{item}</div>)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer>
          <div className="footer-logo">Red<span>Resizer</span></div>
          <div className="footer-text">Free image resizer for RedBubble print-on-demand creators. No signup, no nonsense. © 2025 RedResizer.</div>
        </footer>

      </div>
    </>
  );
}
