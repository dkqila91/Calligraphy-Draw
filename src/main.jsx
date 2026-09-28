import React,{useEffect,useState} from 'react';import{createRoot}from'react-dom/client';import{Maximize,RotateCcw,Volume2,VolumeX}from'lucide-react';import'./style.css';
const DATA={B:{group:'乙组',level:'三、四年级',bm:'Tahun 3 & Tahun 4',questions:[
{title:'静夜思',author:'李白',lines:['床前明月光，','疑是地上霜。','举头望明月，','低头思故乡。']},
{title:'相思',author:'王维',lines:['红豆生南国，','春来发几枝。','愿君多采撷，','此物最相思。']},
{title:'鹿柴',author:'王维',lines:['空山不见人，','但闻人语响。','返景入深林，','复照青苔上。']},
{title:'乐游原',author:'李商隐',lines:['向晚意不适，','驱车登古原。','夕阳无限好，','只是近黄昏。']},
{title:'所见',author:'袁枚',lines:['牧童骑黄牛，','歌声振林樾。','意欲捕鸣蝉，','忽然闭口立。']}]},
A:{group:'甲组',level:'五、六年级',bm:'Tahun 5 & Tahun 6',questions:[
{title:'江上渔者',author:'范仲淹',lines:['江上往来人，','但爱鲈鱼美。','君看一叶舟，','出没风波里。']},
{title:'风',author:'李峤',lines:['解落三秋叶，','能开二月花。','过江千尺浪，','入竹万竿斜。']},
{title:'塞下曲',author:'卢纶',lines:['月黑雁飞高，','单于夜遁逃。','欲将轻骑逐，','大雪满弓刀。']},
{title:'春夜喜雨',author:'杜甫',lines:['野径云俱黑，','江船火独明。','晓看红湿处，','花重锦官城。']},
{title:'赋得古原草送别',author:'白居易',lines:['远芳侵古道，','晴翠接荒城。','又送王孙去，','萋萋满别情。']} ]}};
const nums=['壹','贰','叁','肆','伍'];
const rand=()=>{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%5};
function App(){const[screen,setScreen]=useState('splash'),[cat,setCat]=useState(null),[pick,setPick]=useState(null),[cursor,setCursor]=useState(0),[demo,setDemo]=useState(true),[sound,setSound]=useState(true),[locked,setLocked]=useState(()=>JSON.parse(localStorage.getItem('calligraphy2026')||'{}'));
const c=cat?DATA[cat]:null;
useEffect(()=>{if(screen!=='drawing')return;const target=rand();setPick(target);let i=0,delay=65,t;const step=()=>{setCursor(x=>(x+1)%5);i++;if(i>24)delay+=22;if(i>37)delay+=55;if(i>=43){setCursor(target);setTimeout(()=>setScreen('reveal'),800);return}t=setTimeout(step,delay)};t=setTimeout(step,delay);return()=>clearTimeout(t)},[screen]);
const enter=x=>{setCat(x);setPick(null);setScreen('ready')};
const confirm=()=>{if(!demo){const n={...locked,[cat]:pick};setLocked(n);localStorage.setItem('calligraphy2026',JSON.stringify(n))}setScreen('home')};
const reset=()=>{if(confirm('Reset semua keputusan rasmi?')){localStorage.removeItem('calligraphy2026');setLocked({})}};
const full=()=>document.documentElement.requestFullscreen?.();
if(screen==='splash')return <main className="paper center"><Ink/><div className="seal small">书法</div><div className="eyebrow">2026 年</div><h1>书法比赛</h1><div className="brushline"/><h2>墨韵启题</h2><p className="cnsub">比赛题目抽选仪式</p><p>Gimik Pemilihan Soalan Pertandingan Kaligrafi Cina</p><button className="primary" onClick={()=>setScreen('home')}>进入抽题仪式 <span>MULA</span></button></main>;
if(screen==='home')return <main className="paper"><Ink/><header><div><b>2026年书法比赛</b><small>比赛题目抽选仪式</small></div><div className="tools"><button onClick={()=>setSound(!sound)}>{sound?<Volume2/>:<VolumeX/>}</button><button onClick={full}><Maximize/></button></div></header><section className="home"><div className="title"><span>墨韵启题</span><h2>请选择抽题组别</h2><p>Pilih kategori untuk memulakan pemilihan soalan</p></div><div className="categories">{['B','A'].map(k=>{const d=DATA[k],done=locked[k]!==undefined;return <button className={'category '+(done?'done':'')} disabled={done&&!demo} onClick={()=>enter(k)} key={k}><i>{d.group}</i><h3>{d.level}</h3><p>{d.bm}</p><div className="divider"/>{done&&!demo?<><strong>《{d.questions[locked[k]].title}》</strong><em>✓ 题目已确定</em></>:<em>点击进入 · TEKAN UNTUK MASUK</em>}</button>})}</div><div className="mode"><button className={demo?'active':''} onClick={()=>setDemo(true)}>演示模式 · DEMO</button><button className={!demo?'official':''} onClick={()=>setDemo(false)}>正式模式 · OFFICIAL</button>{Object.keys(locked).length>0&&<button className="reset" onClick={reset}><RotateCcw/> Reset</button>}</div></section></main>;
if(screen==='ready')return <main className="paper center"><Ink/><button className="back" onClick={()=>setScreen('home')}>← 返回</button><div className="group">{c.group} <small>{c.level}</small></div><h2 className="readytitle">五题 · 取其一</h2><p>5 SOALAN · 1 AKAN DIPILIH</p><button className="bigseal" onClick={()=>setScreen('drawing')}><b>抽</b></button><h3>点击印章开始抽题</h3><p>Tekan mohor untuk memulakan pemilihan</p><span className={'badge '+(!demo?'red':'')}>{demo?'演示模式 · DEMO MODE':'正式模式 · OFFICIAL MODE'}</span></main>;
if(screen==='drawing')return <main className="paper center"><Ink/><div className="group">{c.group} <small>{c.level}</small></div><h2 className="readytitle">墨韵流转 · 静候题定</h2><div className="scrolls">{nums.map((n,i)=><div className={'scroll '+(cursor===i?'selected':'')} key={n}><span>{n}</span><b>卷轴</b></div>)}</div><p className="wait">正在抽取比赛题目…</p></main>;
if(screen==='reveal'){const q=c.questions[pick];return <main className="paper center"><Ink/><div className="group">{c.group} <small>{c.level}</small></div><div className="result"><div className="resultseal">题目<br/>确定</div><div className="poem"><h2>《{q.title}》</h2><small>{q.author}</small>{q.lines.map(x=><p key={x}>{x}</p>)}</div></div><h3 className="officialtxt">SOALAN {demo?'DEMO':'RASMI'} DIPILIH</h3><button className="primary" onClick={confirm}>{demo?'完成演示':'确认题目'} <span>{demo?'SELESAI DEMO':'SAHKAN SOALAN'}</span></button></main>}
}
function Ink(){return <><div className="ink ink1"/><div className="ink ink2"/><div className="redmark"/></>};createRoot(document.getElementById('root')).render(<App/>);
