import React,{useEffect,useState}from'react'
import{createRoot}from'react-dom/client'
import{Sparkles,Plus,Menu,Mic,Paperclip,ArrowUp,Sun,Moon,History,Search,Folder,Settings,User}from'lucide-react'
import{supabase}from'./supabase'
import'./styles.css'

function App(){
 const[dark,setDark]=useState(true),[open,setOpen]=useState(true),[text,setText]=useState(''),[messages,setMessages]=useState([]),[session,setSession]=useState(null),[auth,setAuth]=useState(false),[email,setEmail]=useState(''),[status,setStatus]=useState('')
 useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light'},[dark])
 useEffect(()=>{if(!supabase)return;supabase.auth.getSession().then(({data})=>setSession(data.session));const{data:{subscription}}=supabase.auth.onAuthStateChange((_,s)=>setSession(s));return()=>subscription.unsubscribe()},[])
 async function login(){if(!supabase){setStatus('Supabase configuration is not available yet.');return}setStatus('Sending sign-in link…');const{error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin}});setStatus(error?error.message:'Check your email for your sign-in link.')}
 function send(){if(!text.trim())return;setMessages([...messages,{r:'user',t:text},{r:'angel',t:'I’m here. This is Angel’s foundation. Her real intelligence, memory, tools and voice are the next layers we build.'}]);setText('')}
 return <div className="app">
 <aside className={open?'side open':'side'}><div className="brand"><b>✦</b> ANGEL</div><button className="new" onClick={()=>setMessages([])}><Plus size={18}/>New conversation</button><nav><button><Sparkles/>Angel</button><button><History/>History</button><button><Search/>Explore</button><button><Folder/>Projects</button></nav><div className="grow"/><nav><button><Settings/>Settings</button><button onClick={()=>setAuth(true)}><User/>{session?.user?.email||'Sign in'}</button></nav></aside>
 <main><header><button className="icon mobile" onClick={()=>setOpen(!open)}><Menu/></button><div className="pill"><i/>Angel</div><div className="actions"><button className="icon" onClick={()=>setDark(!dark)}>{dark?<Sun/>:<Moon/>}</button><button className="signin" onClick={()=>setAuth(true)}>{session?'Account':'Sign in'}</button></div></header>
 <section>{messages.length===0?<div className="hero"><div className="orb">✦</div><h1>Hello. I’m <span>Angel.</span></h1><p>An evolving AI companion built to help you think, create, remember and eventually take meaningful action.</p><div className="cards"><button onClick={()=>setText('Help me create something extraordinary')}><Sparkles/>Create something<small>Turn an idea into something real.</small></button><button onClick={()=>setText('Help me think through a difficult problem')}><Search/>Think with me<small>Explore a problem deeply.</small></button><button onClick={()=>setText('Help me organize a project')}><Folder/>Build a project<small>Give your work a home and direction.</small></button></div></div>:<div className="messages">{messages.map((m,i)=><div className={'msg '+m.r} key={i}><b>{m.r==='angel'?'✦':'YOU'}</b><p>{m.t}</p></div>)}</div>}</section>
 <div className="compose"><div><button className="icon"><Paperclip/></button><textarea value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} placeholder="Message Angel…"/><button className="icon"><Mic/></button><button className={'send '+(text?'ready':'')} onClick={send}><ArrowUp/></button></div><small>Angel can make mistakes. Important actions should be verified.</small></div></main>
 {auth&&<div className="modal" onClick={()=>setAuth(false)}><div className="auth" onClick={e=>e.stopPropagation()}><div className="authstar">✦</div><h2>Enter Angel’s world</h2><p>Let your conversations and future memory follow you across devices.</p><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email"/><button onClick={login}>Continue with email <ArrowUp size={17}/></button>{status&&<small>{status}</small>}</div></div>}
 </div>
}
createRoot(document.getElementById('root')).render(<App/>)
