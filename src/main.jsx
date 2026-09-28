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
 const cols=[`︽${q.title}︾${q.author}`,...q.lines];
 return <div className={'vertical-question '+(compact?'compact ':'')+(reveal?'reveal':'')}>
  {cols.map((t,i)=><div className={'vcol c'+i} key={i}>{[...t].map((ch,j)=><span className={/[，。！？；：、]/.test(ch)?'punct':''} key={j} style={{'--d':`${(i*5+j)*45}ms`}}>{ch}</span>)}</div>)}
 </div>
}
function Header({audio,setAudio,onAdmin}){return <header><div><b>2026年书法比赛</b><small>比赛题目抽选仪式</small></div><div className="head-actions"><button className="icon" onClick={()=>setAudio(!audio)}>{audio?<Volume2/>:<VolumeX/>}</button><button className="icon" onClick={()=>document.documentElement.requestFullscreen?.()}><Maximize/></button>{onAdmin&&<button className="icon" onClick={onAdmin}><Settings/></button>}</div></header>}
function Seal({onClick,disabled,label='抽'}){return <button disabled={disabled} onClick={onClick} className={'seal '+(disabled?'disabled':'')}><span>{label}</span></button>}

function App(){
 const [screen,setScreen]=useState('splash'),[cat,setCat]=useState(null),[audio,setAudio]=useState(true),[store,setStore]=useState(load),[admin,setAdmin]=useState(false),[preview,setPreview]=useState({cat:'B',i:0}),[stage,setStage]=useState('ready'),[active,setActive]=useState(0),[picked,setPicked]=useState(null),[ink,setInk]=useState(false);
 const ctx=useRef(null),bgm=useRef(null);
 useEffect(()=>save(store),[store]);
 useEffect(()=>{
   if(!bgm.current){bgm.current=new Audio('/bgm.mp3');bgm.current.loop=true;bgm.current.volume=.12}
   if(audio&&screen!=='splash'){bgm.current.play().catch(()=>{})}else{bgm.current.pause()}
   return()=>{}
 },[audio,screen]);
 useEffect(()=>{const f=()=>setScreen('final');document.addEventListener('show-final',f);return()=>document.removeEventListener('show-final',f)},[]);
 const enterApp=()=>{setScreen('home');setTimeout(()=>{if(audio)bgm.current?.play().catch(()=>{})},60)};
 const getCtx=()=>{
  if(!audio)return null;

  try{
    ctx.current??=new(window.AudioContext||window.webkitAudioContext)();

    if(ctx.current.state==='suspended'){
      ctx.current.resume();
    }

    return ctx.current;
  }catch{
    return null;
  }
};

const tone=(f=250,d=.06,type='sine',vol=.10,delay=0)=>{
  const c=getCtx();
  if(!c)return;

  const o=c.createOscillator();
  const g=c.createGain();
  const start=c.currentTime+delay;

  o.type=type;
  o.frequency.setValueAtTime(f,start);

  g.gain.setValueAtTime(.0001,start);
  g.gain.exponentialRampToValueAtTime(vol,start+.01);
  g.gain.exponentialRampToValueAtTime(.0001,start+d);

  o.connect(g);
  g.connect(c.destination);

  o.start(start);
  o.stop(start+d+.02);
};

const fadeBgm=(target,duration=500)=>{
  const a=bgm.current;
  if(!a)return;

  const start=a.volume;
  const diff=target-start;
  const steps=20;
  const interval=duration/steps;
  let i=0;

  const timer=setInterval(()=>{
    i++;
    a.volume=Math.max(0,Math.min(1,start+(diff*(i/steps))));

    if(i>=steps){
      clearInterval(timer);
      a.volume=target;
    }
  },interval);
};

const noise=(duration=.25,volume=.08,delay=0)=>{
  const c=getCtx();
  if(!c)return;

  const length=Math.floor(c.sampleRate*duration);
  const buffer=c.createBuffer(1,length,c.sampleRate);
  const data=buffer.getChannelData(0);

  for(let i=0;i<length;i++){
    data[i]=(Math.random()*2-1)*(1-i/length);
  }

  const source=c.createBufferSource();
  const gain=c.createGain();
  const filter=c.createBiquadFilter();

  filter.type='lowpass';
  filter.frequency.value=1200;

  source.buffer=buffer;

  const start=c.currentTime+delay;

  gain.gain.setValueAtTime(volume,start);
  gain.gain.exponentialRampToValueAtTime(.0001,start+duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);

  source.start(start);
};

// 1. Tekan mohor / mula cabutan
const sfxVoteStart=()=>{
  tone(520,.10,'triangle',.28);
  tone(760,.14,'triangle',.20,.06);
};

// 2. Tick semasa proses cabutan
const sfxShuffle=()=>{
  tone(880,.05,'square',.13);
};

// 3. Lima skrol muncul
const sfxScrollAppear=()=>{
  noise(.40,.20);
  tone(180,.30,'triangle',.14);
  tone(300,.32,'triangle',.12,.08);
  tone(430,.35,'triangle',.10,.16);
};

// 4. Hentakan mohor
const sfxStamp=async()=>{
  const c=await getCtx();
  if(!c)return;

  // hentakan pendek / impact
  noise(.20,.42);

  // bass utama
  const o1=c.createOscillator();
  const g1=c.createGain();

  o1.type='sine';
  o1.frequency.setValueAtTime(125,c.currentTime);
  o1.frequency.exponentialRampToValueAtTime(38,c.currentTime+.42);

  g1.gain.setValueAtTime(.78,c.currentTime);
  g1.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.45);

  o1.connect(g1);
  g1.connect(c.destination);

  o1.start();
  o1.stop(c.currentTime+.46);

  // lapisan hentakan kedua supaya lebih berat
  const o2=c.createOscillator();
  const g2=c.createGain();

  o2.type='triangle';
  o2.frequency.setValueAtTime(72,c.currentTime);
  o2.frequency.exponentialRampToValueAtTime(32,c.currentTime+.32);

  g2.gain.setValueAtTime(.52,c.currentTime);
  g2.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.36);

  o2.connect(g2);
  g2.connect(c.destination);

  o2.start();
  o2.stop(c.currentTime+.38);
};
 const sfxScrollOpen=async()=>{
  const c=await getCtx();
  if(!c)return;

  // bunyi geseran / kertas terbuka
  noise(.85,.15);

  // tonal rise
  tone(160,.45,'triangle',.12);
  tone(230,.50,'triangle',.11,.08);
  tone(330,.55,'triangle',.10,.16);
  tone(460,.60,'sine',.09,.26);

  // bunyi akhir yang lebih ceremonial
  tone(620,.75,'sine',.08,.38);
  tone(930,.70,'sine',.055,.42);
};
 const goHome=()=>{setStage('ready');setPicked(null);setCat(null);setScreen('home')};
 const draw=async()=>{
  if(stage!=='ready')return;

  // turunkan background music masa cabutan bermula
  fadeBgm(.04,500);
  
  // tekan butang 抽
  sfxVoteStart();

  setStage('stamp');

  // mohor pertama menghentak
  setTimeout(()=>{
    sfxStamp();
  },120);

  await sleep(250);

  setInk(true);
  await sleep(650);

  // lima skrol muncul
  setStage('shuffle');
  setInk(false);
  sfxScrollAppear();

  const winner=rand5();

  let seq=[];
  for(let n=0;n<28;n++){
    seq.push(55+n*n*1.55);
  }

  let pos=0;

  // proses undian laju → perlahan
  for(const d of seq){
    pos=(pos+1)%5;
    setActive(pos);

    sfxShuffle();

    await sleep(d);
  }

  // sampai tepat pada soalan yang telah dipilih
  while(pos!==winner){
    pos=(pos+1)%5;
    setActive(pos);

    sfxShuffle();

    await sleep(360);
  }

  setPicked(winner);

  await sleep(700);

  // buka skrol keputusan
  setStage('reveal');
  sfxScrollOpen();

  // mohor 题目确定
setTimeout(()=>{
  sfxStamp();
},1700);

  setTimeout(()=>{
  fadeBgm(.12,900);
},2300);
};
 const confirm=()=>{if(store.mode==='official'){const ns={...store,results:{...store.results,[cat]:picked}};setStore(ns)}goHome()};
 const resultFor=k=>store.results[k]===null?null:DATA[k].questions[store.results[k]];
 return <main>
  <div className="paper-noise"/><div className={'ink-wash '+(ink?'burst':'')}/><div className="corner-stamp"/>
  {screen==='splash'&&
  <section className="splash">
    <button className="primary splash-start" onClick={enterApp}>
      开始抽题
    </button>
  </section>
}
  {screen==='final'&&<><Header audio={audio} setAudio={setAudio}/><section className="final"><div className="eyebrow red">正式题目</div><h2>2026年书法比赛 · 比赛题目</h2><div className="final-grid">{['B','A'].map(k=><div className="final-panel" key={k}><h3>{DATA[k].group} <span>{DATA[k].years}</span></h3>{resultFor(k)&&<VerticalQuestion q={resultFor(k)} compact/>}</div>)}</div><button className="primary" onClick={()=>setScreen('home')}>返回主页　KEMBALI</button></section></>}
  {admin&&<Admin store={store} setStore={setStore} preview={preview} setPreview={setPreview} close={()=>setAdmin(false)} audio={audio} setAudio={setAudio}/>} 
 </main>
}
function Admin({store,setStore,preview,setPreview,close,audio,setAudio}){const q=DATA[preview.cat].questions[preview.i];const reset=k=>{if(confirm(k==='all'?'Reset SEMUA keputusan rasmi?':'Reset keputusan kategori ini?'))setStore({...store,results:k==='all'?{B:null,A:null}:{...store.results,[k]:null}})};return <div className="admin-overlay"><div className="admin"><div className="admin-head"><div><small>管理员模式</small><h2>Admin & Semakan Soalan</h2></div><button className="icon" onClick={close}><X/></button></div><div className="admin-grid"><aside><h3>MOD CABUTAN</h3><button className={store.mode==='demo'?'sel':''} onClick={()=>setStore({...store,mode:'demo'})}><Play/> 演示模式 · Demo</button><button className={store.mode==='official'?'sel official':''} onClick={()=>setStore({...store,mode:'official'})}><ShieldCheck/> 正式模式 · Official</button><hr/><h3>SEMAKAN</h3>{['B','A'].map(k=><button className={preview.cat===k?'sel':''} onClick={()=>setPreview({cat:k,i:0})} key={k}><Eye/> {DATA[k].group} {DATA[k].years}</button>)}<hr/><h3>UTILITI</h3><button onClick={()=>setAudio(!audio)}>{audio?<Volume2/>:<VolumeX/>} Test / Audio {audio?'ON':'OFF'}</button><button onClick={()=>document.documentElement.requestFullscreen?.()}><Maximize/> Fullscreen</button><button disabled={store.results.B===null||store.results.A===null} onClick={()=>{close();document.dispatchEvent(new CustomEvent('show-final'))}}><Eye/> Paparkan 2 Soalan</button><button onClick={()=>reset(preview.cat)}><RotateCcw/> Reset {DATA[preview.cat].group}</button><button className="danger" onClick={()=>reset('all')}><RotateCcw/> Reset Semua</button></aside><div className="preview"><div className="preview-top"><div><small>题目预览 · SEMAKAN SOALAN</small><h3>{DATA[preview.cat].group}（{DATA[preview.cat].years}）</h3></div><b>题目 {String(preview.i+1).padStart(2,'0')} / 05</b></div><div className="preview-paper"><VerticalQuestion q={q}/></div><div className="preview-nav"><button disabled={preview.i===0} onClick={()=>setPreview({...preview,i:preview.i-1})}><ChevronLeft/> 上一题</button><span>《{q.title}》 · {q.author}</span><button disabled={preview.i===4} onClick={()=>setPreview({...preview,i:preview.i+1})}>下一题 <ChevronRight/></button></div><div className="checks"><span>✓ 乙组 5题</span><span>✓ 甲组 5题</span><span>✓ 本地储存 LocalStorage</span><span>✓ 竖排 · 右至左</span></div></div></div></div></div>}
createRoot(document.getElementById('root')).render(<App/>);
