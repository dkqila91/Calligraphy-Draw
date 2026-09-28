import React,{useEffect,useMemo,useRef,useState} from 'react';
import{createRoot}from'react-dom/client';
import{Volume2,VolumeX,Maximize,Settings,X,ChevronLeft,ChevronRight,Eye,RotateCcw,Play,ShieldCheck,Home}from'lucide-react';
import'./styles.css';

const DATA={
 B:{group:'乙组',years:'三、四年级',ms:'Tahun 3 & Tahun 4',questions:[
  {title:'静夜思',author:'李白',lines:['床前明月光，','疑是地上霜。','举头望明月，','低头思故乡。']},
  {title:'相思',author:'王维',lines:['红豆生南国，','春来发几枝。','愿君多采撷，','此物最相思。']},
  {title:'鹿柴',author:'王维',lines:['空山不见人，','但闻人语响。','返景入深林，','复照青苔上。']},
  {title:'乐游原',author:'李商隐',lines:['向晚意不适，','驱车登古原。','夕阳无限好，','只是近黄昏。']},
  {title:'所见',author:'袁枚',lines:['牧童骑黄牛，','歌声振林樾。','意欲捕鸣蝉，','忽然闭口立。']}
 ]},
 A:{group:'甲组',years:'五、六年级',ms:'Tahun 5 & Tahun 6',questions:[
  {title:'江上渔者',author:'范仲淹',lines:['江上往来人，','但爱鲈鱼美。','君看一叶舟，','出没风波里。']},
  {title:'风',author:'李峤',lines:['解落三秋叶，','能开二月花。','过江千尺浪，','入竹万竿斜。']},
  {title:'塞下曲',author:'卢纶',lines:['月黑雁飞高，','单于夜遁逃。','欲将轻骑逐，','大雪满弓刀。']},
  {title:'春夜喜雨',author:'杜甫',lines:['野径云俱黑，','江船火独明。','晓看红湿处，','花重锦官城。']},
  {title:'赋得古原草送别',author:'白居易',lines:['远芳侵古道，','晴翠接荒城。','又送王孙去，','萋萋满别情。']}
 ]}
};
const K='calligraphyDrawV2';
const load=()=>{try{return JSON.parse(localStorage.getItem(K))||{mode:'demo',results:{B:null,A:null}}}catch{return{mode:'demo',results:{B:null,A:null}}}};
const save=s=>localStorage.setItem(K,JSON.stringify(s));
const rand5=()=>{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%5};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function VerticalQuestion({q,reveal=false,compact=false}){
 const cols=[`《${q.title}》${q.author}`,...q.lines];
 return <div className={'vertical-question '+(compact?'compact ':'')+(reveal?'reveal':'')} dir="rtl">
  {cols.map((t,i)=><div className={'vcol c'+i} key={i}>{[...t].map((ch,j)=><span key={j} style={{'--d':`${(i*5+j)*45}ms`}}>{ch}</span>)}</div>)}
 </div>
}
function Header({audio,setAudio,onAdmin}){return <header><div><b>2026年书法比赛</b><small>比赛题目抽选仪式</small></div><div className="head-actions"><button className="icon" onClick={()=>setAudio(!audio)}>{audio?<Volume2/>:<VolumeX/>}</button><button className="icon" onClick={()=>document.documentElement.requestFullscreen?.()}><Maximize/></button>{onAdmin&&<button className="icon" onClick={onAdmin}><Settings/></button>}</div></header>}
function Seal({onClick,disabled,label='抽'}){return <button disabled={disabled} onClick={onClick} className={'seal '+(disabled?'disabled':'')}><span>{label}</span></button>}

function App(){
 const [screen,setScreen]=useState('splash'),[cat,setCat]=useState(null),[audio,setAudio]=useState(true),[store,setStore]=useState(load),[admin,setAdmin]=useState(false),[preview,setPreview]=useState({cat:'B',i:0}),[stage,setStage]=useState('ready'),[active,setActive]=useState(0),[picked,setPicked]=useState(null),[ink,setInk]=useState(false);
 const ctx=useRef(null);
 useEffect(()=>save(store),[store]);
 const tone=(f=250,d=.06,type='wood')=>{if(!audio)return;try{ctx.current??=new(window.AudioContext||window.webkitAudioContext)();const c=ctx.current,o=c.createOscillator(),g=c.createGain();o.type=type==='wood'?'sine':'triangle';o.frequency.value=f;g.gain.setValueAtTime(.10,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+d)}catch{}};
 const goHome=()=>{setStage('ready');setPicked(null);setCat(null);setScreen('home')};
 const draw=async()=>{
  if(stage!=='ready')return; setStage('stamp');tone(95,.28); await sleep(250);setInk(true);await sleep(650);setStage('shuffle');setInk(false);
  const winner=rand5(); let seq=[]; for(let n=0;n<28;n++)seq.push(55+n*n*1.55);
  let pos=0;for(const d of seq){pos=(pos+1)%5;setActive(pos);tone(330,.025);await sleep(d)}
  while(pos!==winner){pos=(pos+1)%5;setActive(pos);tone(300,.03);await sleep(360)}
  setPicked(winner);tone(120,.35);await sleep(700);setStage('reveal');
 };
 const confirm=()=>{if(store.mode==='official'){const ns={...store,results:{...store.results,[cat]:picked}};setStore(ns)}goHome()};
 const resultFor=k=>store.results[k]===null?null:DATA[k].questions[store.results[k]];
 return <main>
  <div className="paper-noise"/><div className={'ink-wash '+(ink?'burst':'')}/><div className="corner-stamp"/>
  {screen==='splash'&&<section className="splash"><div className="brush-dot"/><div className="eyebrow">书法 · 2026年</div><h1>书法比赛</h1><div className="brushline"/><h2>墨韵启题</h2><p className="cnspace">比赛题目抽选仪式</p><p>Gimik Pemilihan Soalan Pertandingan Kaligrafi Cina</p><button className="primary" onClick={()=>setScreen('home')}>进入抽题仪式　<span>MULA</span></button></section>}
  {screen==='home'&&<><Header audio={audio} setAudio={setAudio} onAdmin={()=>setAdmin(true)}/><section className="home"><div className="eyebrow red">墨韵启题</div><h2>请选择抽题组别</h2><p>Pilih kategori untuk memulakan pemilihan soalan</p><div className="cats">{['B','A'].map(k=>{let r=resultFor(k);return <button className={'cat '+(r?'locked':'')} key={k} onClick={()=>{if(r)return;setCat(k);setStage('ready');setScreen('draw')}}><b>{DATA[k].group}</b><strong>{DATA[k].years}</strong><span>{DATA[k].ms}</span><i>{r?`✓ 已确定 · 《${r.title}》`:'点击进入 · TEKAN UNTUK MASUK'}</i></button>})}</div><div className={'mode-badge '+store.mode}>{store.mode==='demo'?'演示模式 · DEMO MODE':'正式模式 · OFFICIAL MODE'}</div>{store.results.B!==null&&store.results.A!==null&&<button className="primary finalbtn" onClick={()=>setScreen('final')}>查看最终题目　PAPARKAN SOALAN RASMI</button>}</section></>}
  {screen==='draw'&&cat&&<section className="draw"><button className="back" onClick={goHome}>← 返回</button><div className="group-title"><b>{DATA[cat].group}</b><span>{DATA[cat].years}</span></div>{stage==='ready'&&<div className="ready"><h2>五题 · 取其一</h2><p>5 SOALAN · 1 AKAN DIPILIH</p><Seal onClick={draw}/><h3>点击印章开始抽题</h3><p>Tekan mohor untuk memulakan pemilihan</p><span className={'mode-badge '+store.mode}>{store.mode==='demo'?'演示模式 · DEMO':'正式模式 · OFFICIAL'}</span></div>}
   {stage==='stamp'&&<div className="stamp-stage"><Seal disabled label="抽"/><h2>启题</h2></div>}
   {stage==='shuffle'&&<div className="shuffle"><h2>墨韵流转 · 静候题定</h2><div className="scrolls">{'壹贰叁肆伍'.split('').map((n,i)=><div key={n} className={'scroll '+(active===i?'active':'')}><div className="rod top"/><b>{n}</b><small>卷<br/>轴</small><div className="rod bottom"/></div>)}</div><p>正在抽取比赛题目…</p></div>}
   {stage==='reveal'&&picked!==null&&<div className="reveal-stage"><div className="winner-scroll"><div className="scroll-cap top"/><VerticalQuestion q={DATA[cat].questions[picked]} reveal/><div className="scroll-cap bottom"/></div><div className="result-seal">题目<br/>确定</div><div className="selected-label">{store.mode==='demo'?'SOALAN DEMO DIPILIH':'SOALAN RASMI DIPILIH'}</div><button className="primary" onClick={confirm}>{store.mode==='demo'?'完成演示　SELESAI DEMO':'确认题目　SAHKAN SOALAN'}</button></div>}
  </section>}
  {screen==='final'&&<><Header audio={audio} setAudio={setAudio}/><section className="final"><div className="eyebrow red">正式题目</div><h2>2026年书法比赛 · 比赛题目</h2><div className="final-grid">{['B','A'].map(k=><div className="final-panel" key={k}><h3>{DATA[k].group} <span>{DATA[k].years}</span></h3>{resultFor(k)&&<VerticalQuestion q={resultFor(k)} compact/>}</div>)}</div><button className="primary" onClick={()=>setScreen('home')}>返回主页　KEMBALI</button></section></>}
  {admin&&<Admin store={store} setStore={setStore} preview={preview} setPreview={setPreview} close={()=>setAdmin(false)} audio={audio} setAudio={setAudio}/>} 
 </main>
}
function Admin({store,setStore,preview,setPreview,close,audio,setAudio}){const q=DATA[preview.cat].questions[preview.i];const reset=k=>{if(confirm(k==='all'?'Reset SEMUA keputusan rasmi?':'Reset keputusan kategori ini?'))setStore({...store,results:k==='all'?{B:null,A:null}:{...store.results,[k]:null}})};return <div className="admin-overlay"><div className="admin"><div className="admin-head"><div><small>管理员模式</small><h2>Admin & Semakan Soalan</h2></div><button className="icon" onClick={close}><X/></button></div><div className="admin-grid"><aside><h3>MOD CABUTAN</h3><button className={store.mode==='demo'?'sel':''} onClick={()=>setStore({...store,mode:'demo'})}><Play/> 演示模式 · Demo</button><button className={store.mode==='official'?'sel official':''} onClick={()=>setStore({...store,mode:'official'})}><ShieldCheck/> 正式模式 · Official</button><hr/><h3>SEMAKAN</h3>{['B','A'].map(k=><button className={preview.cat===k?'sel':''} onClick={()=>setPreview({cat:k,i:0})} key={k}><Eye/> {DATA[k].group} {DATA[k].years}</button>)}<hr/><h3>UTILITI</h3><button onClick={()=>setAudio(!audio)}>{audio?<Volume2/>:<VolumeX/>} Test / Audio {audio?'ON':'OFF'}</button><button onClick={()=>document.documentElement.requestFullscreen?.()}><Maximize/> Fullscreen</button><button onClick={()=>reset(preview.cat)}><RotateCcw/> Reset {DATA[preview.cat].group}</button><button className="danger" onClick={()=>reset('all')}><RotateCcw/> Reset Semua</button></aside><div className="preview"><div className="preview-top"><div><small>题目预览 · SEMAKAN SOALAN</small><h3>{DATA[preview.cat].group}（{DATA[preview.cat].years}）</h3></div><b>题目 {String(preview.i+1).padStart(2,'0')} / 05</b></div><div className="preview-paper"><VerticalQuestion q={q}/></div><div className="preview-nav"><button disabled={preview.i===0} onClick={()=>setPreview({...preview,i:preview.i-1})}><ChevronLeft/> 上一题</button><span>《{q.title}》 · {q.author}</span><button disabled={preview.i===4} onClick={()=>setPreview({...preview,i:preview.i+1})}>下一题 <ChevronRight/></button></div><div className="checks"><span>✓ 乙组 5题</span><span>✓ 甲组 5题</span><span>✓ 本地储存 LocalStorage</span><span>✓ 竖排 · 右至左</span></div></div></div></div></div>}
createRoot(document.getElementById('root')).render(<App/>);
