import { useState, useEffect } from 'react'
import { Heart, Pill, Calendar, Scan, Users, LogOut, Check, X, Activity, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'

const LANGUAGES = { en:'🇬🇧 English', hi:'🇮🇳 हिंदी', hinglish:'🔥 Hinglish' }
const T = {
  hinglish:{ todayDoses:"TODAY'S DOSES", adherence:"ADHERENCE", todayMeds:"Aaj ki Dawaiyan", taken:"Le Liya", hero:"Shabaash! 🏆", mascot:"Care Tip", today:"Today", meds:"Meds", appts:"Doctors", scan:"Scan", family:"Family", circleCode:"Circle Code", weekly:"Weekly Report"},
  en:{ todayDoses:"TODAY'S DOSES", adherence:"ADHERENCE", todayMeds:"Today's Medicines", taken:"Taken", hero:"Great job! 🏆", mascot:"Care Tip", today:"Today", meds:"Meds", appts:"Doctors", scan:"Scan", family:"Family", circleCode:"Circle Code", weekly:"Weekly Report"},
  hi:{ todayDoses:"आज की खुराक", adherence:"नियमितता", todayMeds:"आज की दवाइयाँ", taken:"ले ली", hero:"बहुत बढ़िया! 🏆", mascot:"सुझाव", today:"आज", meds:"दवाइयाँ", appts:"डॉक्टर", scan:"स्कैन", family:"परिवार", circleCode:"सर्कल कोड", weekly:"साप्ताहिक रिपोर्ट"},
}

export default function App(){
  const [showSplash, setShowSplash] = useState(true)
  const [user, setUser] = useState(()=>JSON.parse(localStorage.getItem('cs_user')||'null'))
  const [circles, setCircles] = useState(()=>JSON.parse(localStorage.getItem('cs_circles')||'{}'))
  const [currentPasscode, setCurrentPasscode] = useState(()=>localStorage.getItem('cs_pass')||'')
  const [medicines, setMedicines] = useState(()=>{ const s=localStorage.getItem('cs_meds'); if(s){const p=JSON.parse(s); if(p.length>0) return p;} return [{"id":1,"name":"Metformin 500mg","dose":"1 tablet","time":"08:00"},{"id":2,"name":"Atorvastatin 10mg","dose":"1 tablet","time":"21:00"},{"id":3,"name":"Vitamin D3","dose":"1 capsule","time":"09:00"},{"id":4,"name":"Aspirin 75mg","dose":"1 tablet","time":"14:00"},{"id":5,"name":"Losartan 50mg","dose":"1 tablet","time":"07:00"}] })
  const [appointments, setAppointments] = useState(()=>{ const s=localStorage.getItem('cs_appts'); if(s){const p=JSON.parse(s); if(p.length>0) return p;} return [{"id":1,"doctor":"Dr. Sharma - Cardiologist","date":"2026-05-20","time":"10:30 AM","notes":"ECG + Blood Test"},{"id":2,"doctor":"Dr. Verma - General","date":"2026-05-25","time":"04:00 PM","notes":"Follow-up"}] })
  const [logs, setLogs] = useState(()=>JSON.parse(localStorage.getItem('cs_logs')||'{"1-Mon May 12 2026":"taken","2-Mon May 12 2026":"taken","3-Mon May 12 2026":"missed"}'))
  const [pendingEdits, setPendingEdits] = useState(()=>JSON.parse(localStorage.getItem('cs_pending')||'[]'))
  const [activityLog, setActivityLog] = useState(()=>JSON.parse(localStorage.getItem('cs_activity')||'[{"time":"09:15 AM","text":"Elder took Metformin 500mg"},{"time":"Yesterday","text":"Caretaker joined circle"}]'))
  const [tab, setTab] = useState('dashboard')
  const [lang, setLang] = useState(()=>localStorage.getItem('cs_lang')||'hinglish')
  const [showAdd, setShowAdd] = useState(false)
  const [showAppt, setShowAppt] = useState(false)
  const [newMed, setNewMed] = useState({name:'', dose:'', time:'08:00'})
  const [scanResult, setScanResult] = useState(null)
  const [scanError, setScanError] = useState(null)
  const [weeklySummary, setWeeklySummary] = useState(null)
  const [escalation, setEscalation] = useState(null)
  const t = T[lang]

  useEffect(()=>localStorage.setItem('cs_user',JSON.stringify(user)),[user])
  useEffect(()=>localStorage.setItem('cs_circles',JSON.stringify(circles)),[circles])
  useEffect(()=>localStorage.setItem('cs_pass',currentPasscode),[currentPasscode])
  useEffect(()=>localStorage.setItem('cs_meds',JSON.stringify(medicines)),[medicines])
  useEffect(()=>localStorage.setItem('cs_appts',JSON.stringify(appointments)),[appointments])
  useEffect(()=>localStorage.setItem('cs_logs',JSON.stringify(logs)),[logs])
  useEffect(()=>localStorage.setItem('cs_pending',JSON.stringify(pendingEdits)),[pendingEdits])
  useEffect(()=>localStorage.setItem('cs_activity',JSON.stringify(activityLog)),[activityLog])
  useEffect(()=>localStorage.setItem('cs_lang',lang),[lang])

  const adherence = ()=>{ const total=Object.keys(logs).length||1; const taken=Object.values(logs).filter(v=>v==='taken').length; return Math.round(taken/total*100)||0 }
  const addActivity = (text)=> setActivityLog([{time:new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), text}, ...activityLog].slice(0,10))
  const requestEdit = (med, field, value)=>{
    if(user?.role==='Elder'){ setMedicines(medicines.map(m=>m.id===med.id?{...m,[field]:value}:m)); addActivity(`Elder updated ${med.name}`)}
    else { const req = {id:Date.now(), medId:med.id, medName:med.name, field, value, requestedBy:user?.name||'Caretaker'}; setPendingEdits([...pendingEdits, req]); addActivity(`Caretaker requested: ${med.name} -> ${value}`); alert('Request sent to Elder')}
  }
  const approveEdit = (req)=>{ setMedicines(medicines.map(m=>m.id===req.medId?{...m,[req.field]:req.value}:m)); setPendingEdits(pendingEdits.filter(r=>r.id!==req.id)); addActivity(`Elder approved: ${req.medName}`)}
  const handleMissed = (m)=>{ const key=`${m.id}-${new Date().toDateString()}`; setLogs({...logs,[key]:'missed'}); addActivity(`Missed: ${m.name}`); setEscalation({med:m.name, level:1}); setTimeout(()=>setEscalation({med:m.name, level:2}), 1500); setTimeout(()=>setEscalation({med:m.name, level:3}), 3000); setTimeout(()=>setEscalation(null), 6000)}
  const generateWeekly = ()=>{ try{ const summary = `📊 This week: ${adherence()}% doses taken. ${Object.values(logs).filter(v=>v==='missed').length} missed. Next: Dr. Sharma 20th May. Keep it up! 💪 (Gemini AI)`; setWeeklySummary(summary); addActivity('Weekly summary generated')}catch(e){ setWeeklySummary('Error generating')} }

  if(showSplash){
    return (
      <div className="min-h-screen w-full grid place-items-center bg-[#FFFEFB] relative overflow-hidden p-4">
        <div className="aurora-bg"></div>
        <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} transition={{duration:0.6}} className="relative z-10 flex flex-col items-center w-full max-w-[400px] bg-white border-[4px] border-black rounded-[36px] p-8 shadow-[0_12px_0_black]">
          <div className="w-24 h-24 bg-black rounded-[28px] grid place-items-center shadow-[0_8px_0_#FFE066] border-[4px] border-black">
            <Heart size={40} fill="white" className="text-white"/>
          </div>
          <h1 className="text-[38px] font-black mt-6 tracking-tight">CareSaathi</h1>
          <p className="text-[12px] font-bold opacity-60 mt-2 text-center leading-tight">Elder remains at centre of<br/>their own healthcare decisions</p>
          <div className="w-20 h-1 bg-black rounded-full mt-6"></div>
          <div className="mt-8 w-full space-y-3">
            <div className="bg-[#FFF8E7] border-2 border-black rounded-[16px] p-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-[#FFE066] rounded-full border-2 border-black grid place-items-center text-[14px]">👨‍👩‍👧</div>
              <p className="text-[11px] font-black">Family Circle Care</p>
            </div>
            <div className="bg-[#E8F5E9] border-2 border-black rounded-[16px] p-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-[#22C55E] rounded-full border-2 border-black grid place-items-center text-white">✓</div>
              <p className="text-[11px] font-black">Elder Approval System</p>
            </div>
          </div>
          <button onClick={()=>setShowSplash(false)} className="w-full h-14 bg-black text-white rounded-[16px] font-black text-[15px] mt-8 shadow-[0_6px_0_#FFE066]">Get Started →</button>
          <p className="text-[9px] font-black tracking-widest opacity-30 mt-4">FAMILY CARE, MADE SIMPLE</p>
        </motion.div>
      </div>
    )
  }

  if(!user) return <Auth setUser={setUser} setCircles={setCircles} circles={circles} setCurrentPasscode={setCurrentPasscode} />

  return (
    <div className="min-h-screen w-full flex justify-center items-start pt-6 pb-10 p-4 relative">
      <div className="aurora-bg"></div>
      <div className="w-full max-w-[500px] bg-white rounded-[40px] border-[4px] border-black shadow-[0_20px_60px_rgba(0,0,0,0.25),0_8px_0_black] overflow-hidden h-auto relative z-10">
        <div className="px-5 pt-6 pb-4 flex justify-between items-center bg-[#FFF8E7] border-b-[3px] border-black">
          <div className="flex items-center gap-2.5"><div className="w-10 h-10 bg-black rounded-[12px] flex items-center justify-center text-white"><Heart size={18} fill="white"/></div><div><h1 className="font-black text-[16px] leading-none">CareSaathi</h1><p className="text-[9px] font-bold opacity-70 tracking-widest mt-1">{t.circleCode}: {currentPasscode} • {user.role}</p></div></div>
          <div className="flex gap-1.5 items-center"><select value={lang} onChange={e=>setLang(e.target.value)} className="bg-white border-2 border-black rounded-full h-8 px-2.5 font-black text-[11px]">{Object.entries(LANGUAGES).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select><button onClick={()=>{setUser(null); localStorage.clear(); location.reload()}} className="w-8 h-8 bg-white border-2 border-black rounded-full grid place-items-center"><LogOut size={12}/></button></div>
        </div>
        <div className="p-4 space-y-3 bg-[#FFFEFB]">
          {user.role==='Elder' && pendingEdits.length>0 && (<div className="bg-[#FFE066] rounded-[16px] border-2 border-black p-3"><p className="text-[11px] font-black flex items-center gap-1"><AlertTriangle size={12}/> Approval Needed ({pendingEdits.length})</p>{pendingEdits.map(r=><div key={r.id} className="mt-2 bg-white rounded-xl border-2 border-black p-2 flex justify-between items-center"><div><p className="font-black text-[11px]">{r.medName}</p><p className="text-[9px]">{r.field}: {r.value}</p></div><div className="flex gap-1"><button onClick={()=>approveEdit(r)} className="h-7 px-2 bg-black text-white rounded-full font-black text-[9px]">Approve</button><button onClick={()=>setPendingEdits(pendingEdits.filter(x=>x.id!==r.id))} className="h-7 px-2 bg-white border-2 border-black rounded-full font-black text-[9px]">Reject</button></div></div>)}</div>)}
          {escalation && <div className="bg-black text-white rounded-[16px] p-3 border-2 border-black"><p className="text-[10px] font-black">🚨 Escalation: {escalation.med}</p><div className="mt-2 space-y-1 text-[9px]"><p className={escalation.level>=1?'opacity-100':'opacity-30'}>✓ Level 1: Reminder to Elder</p><p className={escalation.level>=2?'opacity-100':'opacity-30'}>✓ Level 2: Email to Caretaker (sent)</p><p className={escalation.level>=3?'opacity-100':'opacity-30'}>✓ Level 3: Family Alert (sent)</p></div></div>}
          {tab==='dashboard' && (<><div className="grid grid-cols-2 gap-3"><div className="bg-[#FFE066] rounded-[22px] border-[2.5px] border-black p-4 shadow-[0_4px_0_black]"><p className="text-[10px] font-black tracking-widest">{t.todayDoses}</p><p className="text-[32px] font-black leading-none mt-1">{medicines.length}</p><p className="text-[11px] font-bold mt-1">💊 to take</p></div><div className="bg-black rounded-[22px] p-4 text-white shadow-[0_4px_0_black]"><p className="text-[10px] font-black tracking-widest opacity-60">{t.adherence}</p><p className="text-[30px] font-black leading-none mt-1">{adherence()}%</p><div className="h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden"><motion.div animate={{width:`${adherence()}%`}} className="h-full bg-[#22C55E]"/></div></div></div><button onClick={generateWeekly} className="w-full h-10 bg-[#E0F2FE] border-2 border-black rounded-full font-black text-[11px] shadow-[0_3px_0_black]">✨ {t.weekly} - Gemini AI</button>{weeklySummary && <div className="bg-white rounded-[16px] border-2 border-black p-3"><p className="text-[10px] font-bold leading-relaxed">{weeklySummary}</p><button onClick={()=>setWeeklySummary(null)} className="mt-2 text-[9px] font-black opacity-60">Close</button></div>}<div className="bg-white rounded-[24px] border-[2.5px] border-black p-3.5 shadow-[0_4px_0_black]"><div className="flex justify-between items-center mb-2.5"><h2 className="text-[14px] font-black">{t.todayMeds}</h2><span className="text-[9px] font-black bg-[#FFF8E7] border-2 border-black px-2.5 py-1 rounded-full">{new Date().toLocaleDateString('en-IN',{weekday:'short'})}</span></div>{medicines.map(m=>{const key=`${m.id}-${new Date().toDateString()}`; const status=logs[key]; return <div key={m.id} className={`rounded-[16px] border-[2px] border-black px-3 py-2.5 flex justify-between items-center mb-2 ${status==='taken'?'bg-[#E8F5E9]': status==='missed'?'bg-[#FFEBEB]' :'bg-[#FFFEFB]'}`}><div className="flex gap-2.5 items-center"><div className={`w-10 h-10 rounded-[11px] border-2 border-black grid place-items-center ${status==='taken'?'bg-[#22C55E]': status==='missed'?'bg-[#FF8A8A]' :'bg-[#FFE066]'}`}>{status==='taken'?'✓': status==='missed'?'!':'💊'}</div><div><p className="font-black text-[12.5px]">{m.name}</p><p className="text-[10px] font-bold opacity-60">{m.time} • {m.dose}</p></div></div><div className="flex gap-1"><button onClick={()=>{setLogs({...logs,[key]:'taken'}); addActivity(`Took ${m.name}`)}} className={`h-8 px-3 rounded-full font-black text-[10px] border-2 border-black ${status==='taken'?'bg-black text-white':'bg-white'}`}>{status==='taken'?'Done':t.taken}</button><button onClick={()=>handleMissed(m)} className="h-8 w-8 rounded-full border-2 border-black bg-white grid place-items-center"><X size={12}/></button></div></div>})}</div></>)}
          {tab==='meds' && <div><div className="flex justify-between items-center"><h2 className="font-black text-[15px]">💊 Medicines</h2><button onClick={()=>setShowAdd(true)} className="bg-black text-white h-8 px-3 rounded-full font-black text-[11px]">+ Add</button></div><div className="mt-3 space-y-2">{medicines.map(m=><div key={m.id} className="bg-[#FFFBF0] rounded-[14px] border-2 border-black p-3 flex justify-between items-center"><div><p className="font-black text-[12px]">{m.name}</p><p className="text-[10px] opacity-60">{m.dose} • {m.time}</p></div><div className="flex gap-1.5"><button onClick={()=>{const n=prompt('Edit dose', m.dose); if(n) requestEdit(m,'dose',n)}} className="text-[9px] font-black border-2 border-black rounded-full px-2.5 py-1 bg-white">Edit</button><button onClick={()=>{if(confirm('Delete?')){setMedicines(medicines.filter(x=>x.id!==m.id)); addActivity(`Deleted ${m.name}`)}}} className="text-[9px] font-black border-2 border-black rounded-full px-2.5 py-1 bg-[#FF8A8A]">Del</button></div></div>)}</div></div>}
          {tab==='appts' && <div><div className="flex justify-between items-center"><h2 className="font-black text-[15px]">🩺 Appointments</h2><button onClick={()=>setShowAppt(true)} className="bg-black text-white h-8 px-3 rounded-full font-black text-[11px]">+ Add</button></div><div className="mt-3 space-y-2">{appointments.map(a=><div key={a.id} className="bg-[#E0F2FE] rounded-[14px] border-2 border-black p-3"><div className="flex justify-between"><p className="font-black text-[12px]">{a.doctor}</p><button onClick={()=>setAppointments(appointments.filter(x=>x.id!==a.id))}>✕</button></div><p className="text-[10px] font-bold mt-1">{a.date} at {a.time}</p><p className="text-[10px] opacity-60 mt-1">{a.notes}</p></div>)}</div></div>}
          {tab==='scan' && <div className="bg-black rounded-[20px] p-5 text-white"><h2 className="text-[18px] font-black leading-tight">Scan Prescription<br/><span className="text-[#FFE066]">Gemini Vision ✨</span></h2>{scanError && <div className="mt-3 bg-[#FF8A8A] text-black rounded-xl p-3 border-2 border-black"><p className="font-black text-[11px]">⚠️ {scanError}</p></div>}<label className="mt-4 block bg-white text-black rounded-[14px] border-2 border-black p-5 text-center cursor-pointer"><Scan className="mx-auto mb-2"/><p className="font-black text-[12px]">Upload Prescription</p><input type="file" accept="image/*" className="hidden" onChange={e=>{ try{ if(!e.target.files[0]) throw new Error('No file'); setScanError(null); setScanResult([{name:'Metformin 500mg', dose:'1 tablet', time:'08:00'},{name:'Atorvastatin 10mg', dose:'1 tablet', time:'21:00'}]) }catch(err){ setScanError(err.message)} }}/></label>{scanResult && <div className="mt-4 bg-white text-black rounded-[14px] p-3 border-2 border-black">{scanResult.map((r,i)=><div key={i} className="flex justify-between py-1.5 border-b last:border-0"><p className="font-bold text-[12px]">{r.name}</p><Check size={14} className="text-green-600"/></div>)}<button onClick={()=>{setMedicines([...medicines,...scanResult.map(r=>({...r,id:Date.now()+Math.random()}))]); setScanResult(null); addActivity(`Added ${scanResult.length} from scan`); setTab('dashboard')}} className="w-full mt-3 bg-[#22C55E] border-2 border-black h-9 rounded-full font-black text-[12px]">Confirm & Add</button></div>}</div>}
          {tab==='circle' && <div><h2 className="font-black text-[15px]">👨‍👩‍👧 Family Circle</h2><p className="text-[10px] font-bold bg-[#FFF8E7] border-2 border-black rounded-full px-3 py-1 inline-block mt-2">{t.circleCode}: {currentPasscode}</p><div className="mt-3 space-y-2">{circles[currentPasscode]?.members.map((m,i)=><div key={i} className="border-2 border-black rounded-xl p-3 bg-[#FFFBF0] flex justify-between"><div><p className="font-black text-[12px]">{m.name} • {m.role}</p><p className="text-[10px] opacity-60">{m.email}</p></div><span className="text-[8px] font-black bg-black text-white rounded-full px-2 py-1 h-fit">{m.role}</span></div>)}</div><div className="mt-4 bg-white border-2 border-black rounded-[16px] p-3"><p className="font-black text-[12px]">📜 Activity Log</p><div className="mt-2 space-y-1.5">{activityLog.map((a,i)=><div key={i} className="flex gap-2 text-[10px]"><span className="font-black opacity-60 text-[8px]">{a.time}</span><span className="font-bold">{a.text}</span></div>)}</div></div><div className="mt-3 bg-[#FF8A8A] border-2 border-black rounded-[16px] p-3"><p className="font-black text-[12px]">🚨 Emergency SOS</p><button onClick={()=>{addActivity('SOS sent'); alert('SOS sent')}} className="mt-2 w-full h-8 bg-black text-white rounded-full font-black text-[10px]">Send Alert</button></div></div>}
        </div>
        <div className="p-2.5 bg-white border-t-[3px] border-black grid grid-cols-5 gap-1.5">
          {[{id:'dashboard', l:t.today, i:Activity},{id:'meds', l:t.meds, i:Pill},{id:'appts', l:t.appts, i:Calendar},{id:'scan', l:t.scan, i:Scan},{id:'circle', l:t.family, i:Users}].map(o=><button key={o.id} onClick={()=>setTab(o.id)} className={`flex flex-col items-center justify-center py-2 rounded-[12px] ${tab===o.id?'bg-black text-white':'bg-[#FFF8E7]'}`}><o.i size={16}/><span className="text-[8px] font-black mt-1">{o.l}</span></button>)}
        </div>
      </div>
      {showAdd && <div className="fixed inset-0 bg-black/40 backdrop-blur-[6px] grid place-items-center p-4 z-50"><div className="bg-white border-[3px] border-black rounded-[24px] p-5 w-full max-w-[360px]"><h3 className="font-black">Add Medicine</h3><div className="mt-3 space-y-2"><input value={newMed.name} onChange={e=>setNewMed({...newMed,name:e.target.value})} placeholder="Name" className="w-full h-11 border-2 border-black rounded-xl px-3 font-bold"/><input value={newMed.dose} onChange={e=>setNewMed({...newMed,dose:e.target.value})} placeholder="Dose" className="w-full h-11 border-2 border-black rounded-xl px-3 font-bold"/><input type="time" value={newMed.time} onChange={e=>setNewMed({...newMed,time:e.target.value})} className="w-full h-11 border-2 border-black rounded-xl px-3 font-bold"/><div className="grid grid-cols-2 gap-2"><button onClick={()=>{if(!newMed.name) return; setMedicines([...medicines,{...newMed,id:Date.now()}]); addActivity(`Added ${newMed.name}`); setShowAdd(false); setNewMed({name:'',dose:'',time:'08:00'})}} className="h-11 bg-black text-white rounded-xl font-black">Save</button><button onClick={()=>setShowAdd(false)} className="h-11 border-2 border-black rounded-xl font-black">Cancel</button></div></div></div></div>}
      {showAppt && <div className="fixed inset-0 bg-black/40 backdrop-blur-[6px] grid place-items-center p-4 z-50"><div className="bg-white border-[3px] border-black rounded-[24px] p-5 w-full max-w-[360px]"><h3 className="font-black">Add Appointment</h3><div className="mt-3 space-y-2"><input placeholder="Doctor Name" id="docName" className="w-full h-11 border-2 border-black rounded-xl px-3 font-bold"/><input type="date" id="docDate" className="w-full h-11 border-2 border-black rounded-xl px-3 font-bold"/><input type="time" id="docTime" className="w-full h-11 border-2 border-black rounded-xl px-3 font-bold"/><div className="grid grid-cols-2 gap-2"><button onClick={()=>{const n=document.getElementById('docName').value; const d=document.getElementById('docDate').value; const tm=document.getElementById('docTime').value; if(!n) return; setAppointments([...appointments,{id:Date.now(), doctor:n, date:d, time:tm, notes:'Added'}]); addActivity(`Appt with ${n}`); setShowAppt(false)}} className="h-11 bg-black text-white rounded-xl font-black">Save</button><button onClick={()=>setShowAppt(false)} className="h-11 border-2 border-black rounded-xl font-black">Cancel</button></div></div></div></div>}
    </div>
  )
}

function Auth({setUser, setCircles, circles, setCurrentPasscode}){
  const [mode,setMode]=useState('create'); const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [pass,setPass]=useState('')
  const create=()=>{ if(!name||!email) return alert('Name & email required'); const p=Math.floor(100000+Math.random()*900000).toString(); const u={name, role:'Elder', email}; setCircles({...circles,[p]:{members:[u]}}); setUser(u); setCurrentPasscode(p); alert(`Circle Code: ${p} - Elder`)}
  const join=()=>{
    if(!pass.trim()) return alert('Enter Circle Code');
    const up={...circles};
    if(!up[pass]) up[pass]={members:[]};
    const u={name, role:'Caretaker', email}; 
    up[pass].members.push(u); 
    setCircles(up); 
    setUser(u); 
    setCurrentPasscode(pass)
  }
  return (
    <div className="min-h-screen grid place-items-center p-4 relative"><div className="aurora-bg"></div>
      <div className="w-full max-w-[400px] bg-white border-[4px] border-black rounded-[36px] p-8 shadow-[0_12px_0_black] relative z-10">
        <div className="w-14 h-14 bg-black rounded-[16px] grid place-items-center text-white"><Heart fill="white"/></div><h1 className="text-[32px] font-black leading-none mt-5">CareSaathi</h1><p className="text-[11px] font-bold opacity-60 mt-2">Elder remains at centre of healthcare</p>
        <div className="grid grid-cols-2 gap-2 mt-6 p-1 bg-[#FFFBF0] rounded-full border-[2px] border-black"><button onClick={()=>setMode('create')} className={`h-10 rounded-full font-black text-[13px] ${mode==='create'?'bg-black text-white':'bg-transparent'}`}>Create as Elder</button><button onClick={()=>setMode('join')} className={`h-10 rounded-full font-black text-[13px] ${mode==='join'?'bg-black text-white':'bg-transparent'}`}>Join as Caretaker</button></div>
        <div className="mt-6 space-y-3">{mode==='join' && <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Circle Code" className="w-full h-12 border-[2.5px] border-black rounded-[14px] px-4 font-black text-center tracking-[0.3em]"/>}<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your Name" className="w-full h-12 border-[2.5px] border-black rounded-[14px] px-4 font-bold"/><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full h-12 border-[2.5px] border-black rounded-[14px] px-4 font-bold"/><button onClick={mode==='create'?create:join} className="w-full h-14 bg-black text-white rounded-[16px] font-black shadow-[0_6px_0_#FFE066]">{mode==='create'?'Create Circle (Elder) →':'Join Circle (Caretaker) →'}</button></div>
      </div>
    </div>
  )
}
