
import React, { useState, useEffect } from 'react';
import { Mic, User, LogOut, Loader2, Sparkles, Volume2, Zap, Trophy, ShieldAlert, BookOpen, Target, Search, ExternalLink, Activity, Info, AlertCircle, ChevronRight, Book, CheckCircle2, XCircle } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { StudentProfile, LearnerMode, ExamPrediction, EvaluationResult } from './types';
import { SYLLABUS } from './constants';
import { generateStrictQuestion, evaluateStrictAnswer, speakText, searchDoubt } from './services/geminiService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Record<string, StudentProfile>>({});
  const [nameInput, setNameInput] = useState('');
  
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>('');

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentMode, setCurrentMode] = useState<LearnerMode | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [lastEval, setLastEval] = useState<EvaluationResult | null>(null);
  const [showWarning, setShowWarning] = useState<string | null>(null);
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [doubtQuery, setDoubtQuery] = useState('');
  const [doubtResult, setDoubtResult] = useState<{ text: string; sources: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('mindflow_profiles');
    if (saved) setProfiles(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (currentUser && profiles[currentUser]) {
      localStorage.setItem('mindflow_profiles', JSON.stringify(profiles));
    }
  }, [profiles, currentUser]);

  useEffect(() => {
    setSelectedTopic('');
    setSelectedSubtopic('');
  }, [selectedSubject]);

  useEffect(() => {
    setSelectedSubtopic('');
  }, [selectedTopic]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    const name = nameInput.trim();
    if (!profiles[name]) {
      setProfiles(prev => ({
        ...prev,
        [name]: { name, scores: [], mastery: {}, sessions: [] }
      }));
    }
    setCurrentUser(name);
  };

  const selectMode = (mode: LearnerMode) => {
    setCurrentMode(mode);
    setShowWarning(null);
    speakText(mode === LearnerMode.FAST_A ? "Fast learner mode A activated." : "Slow learner mode C activated. Starting Mission Forty Plus.");
  };

  const startSessionFlow = async () => {
    if (!selectedSubtopic) {
      setShowWarning("Select Subject, Topic, and Sub-Topic first.");
      return;
    }
    if (currentMode === null) {
      setShowWarning("Choose A or C first.");
      return;
    }

    setShowWarning(null);
    setIsSessionActive(true);
    setLastEval(null);
    setTranscript('');
    fetchQuestion();
  };

  const fetchQuestion = async () => {
    setIsLoading(true);
    try {
      const question = await generateStrictQuestion(selectedSubtopic, currentMode!);
      setCurrentQuestion(question);
      speakText(question);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitRecognition;
    const recognitionObj = SpeechRecognition ? new SpeechRecognition() : null;
    if (!recognitionObj) return alert("Speech recognition not supported.");
    
    recognitionObj.lang = 'en-US';
    recognitionObj.onstart = () => setIsListening(true);
    recognitionObj.onend = () => setIsListening(false);
    recognitionObj.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      handleAnswer(result);
    };

    recognitionObj.start();
  };

  const handleAnswer = async (answer: string) => {
    if (!currentUser || !currentQuestion) return;
    setIsLoading(true);
    
    try {
      const evaluation = await evaluateStrictAnswer(selectedSubtopic, currentQuestion, answer, currentMode!);
      setLastEval(evaluation);
      
      const score = evaluation.isCorrect ? 100 : 0;
      setProfiles(prev => {
        const p = { ...prev[currentUser] };
        p.scores = [...(p.scores || []), score];
        p.mastery = { ...p.mastery };
        const m = p.mastery[selectedSubtopic] || 50;
        p.mastery[selectedSubtopic] = Math.max(0, Math.min(100, m + (score === 100 ? 12 : -18)));
        return { ...prev, [currentUser]: p };
      });

      const feedbackVoice = evaluation.isCorrect ? "Correct." : "Wrong.";
      speakText(feedbackVoice);
      if (!evaluation.isCorrect) {
        setTimeout(() => speakText(`The answer is ${evaluation.finalAnswer}`), 1000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoubtSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!doubtQuery.trim()) return;
    setIsSearching(true);
    try {
      const result = await searchDoubt(doubtQuery);
      setDoubtResult(result);
      speakText(result.text);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const getPrediction = (profile?: StudentProfile): ExamPrediction => {
    if (!profile || !profile.scores || profile.scores.length === 0) return ExamPrediction.UNKNOWN;
    const avg = profile.scores.reduce((a, b) => a + b, 0) / profile.scores.length;
    if (avg < 40) return ExamPrediction.FAIL_RISK;
    if (avg < 60) return ExamPrediction.PASS;
    if (avg < 80) return ExamPrediction.FIRST_CLASS;
    return ExamPrediction.DISTINCTION;
  };

  if (!currentUser || !profiles[currentUser]) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#010812]">
        <div className="bg-[#020b18] w-full max-w-md p-10 rounded-[40px] border border-slate-800 glow-cyan relative overflow-hidden">
          <div className="flex justify-center mb-8"><Sparkles className="w-12 h-12 text-cyan animate-pulse" /></div>
          <h1 className="text-4xl font-black text-center mb-2 text-white">MindFlow</h1>
          <p className="text-slate-400 text-center mb-10 font-bold uppercase tracking-widest text-xs">Strict SSLC Examiner Core</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:outline-none"
              placeholder="Student Name" required
            />
            <button type="submit" className="w-full bg-cyan text-slate-950 font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-tighter">
              START ASSESSMENT <Zap className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  const profile = profiles[currentUser];
  const prediction = getPrediction(profile);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-24">
      <header className="flex justify-between items-center bg-slate-900/50 backdrop-blur-xl p-5 rounded-3xl border border-slate-800 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-cyan/20 p-2 rounded-xl border border-cyan/30"><Sparkles className="w-7 h-7 text-cyan" /></div>
          <div>
            <h2 className="text-2xl font-black text-white">{profile.name}</h2>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${prediction === 'FAIL RISK' ? 'border-red-900 bg-red-950 text-red-500' : 'border-slate-700 bg-slate-800 text-slate-400'} uppercase`}>
              {prediction}
            </span>
          </div>
        </div>
        <button onClick={() => setCurrentUser(null)} className="p-3 text-slate-500 hover:text-white rounded-xl border border-slate-800 transition-all"><LogOut className="w-5 h-5" /></button>
      </header>

      {!isSessionActive && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] shadow-xl">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Book className="w-4 h-4 text-cyan" /> Select Chapter</h3>
            <div className="space-y-4">
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-4 text-white appearance-none cursor-pointer">
                <option value="">-- Choose Subject --</option>
                {Object.keys(SYLLABUS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} disabled={!selectedSubject} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-4 text-white appearance-none cursor-pointer disabled:opacity-30">
                <option value="">-- Choose Topic --</option>
                {selectedSubject && SYLLABUS[selectedSubject] && Object.keys(SYLLABUS[selectedSubject]).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={selectedSubtopic} onChange={(e) => setSelectedSubtopic(e.target.value)} disabled={!selectedTopic} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-4 text-white appearance-none cursor-pointer disabled:opacity-30">
                <option value="">-- Choose Sub-Topic --</option>
                {selectedTopic && SYLLABUS[selectedSubject]?.[selectedTopic]?.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
          </section>

          <section className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] shadow-xl">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><User className="w-4 h-4 text-cyan" /> Exam Mission</h3>
            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => selectMode(LearnerMode.FAST_A)} className={`py-6 rounded-3xl border-2 transition-all flex items-center justify-center gap-3 ${currentMode === LearnerMode.FAST_A ? 'bg-cyan border-cyan text-slate-950 font-black' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                  <Zap className="w-6 h-6" /> 🅰 FAST LEARNER (MODE A)
              </button>
              <button onClick={() => selectMode(LearnerMode.SLOW_C)} className={`py-6 rounded-3xl border-2 transition-all flex items-center justify-center gap-3 ${currentMode === LearnerMode.SLOW_C ? 'bg-orange-500 border-orange-500 text-white font-black' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                  <ShieldAlert className="w-6 h-6" /> 🅲 SLOW LEARNER (MODE C)
              </button>
            </div>
          </section>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <section className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 md:p-10 shadow-2xl relative min-h-[500px]">
            <div className="flex items-center gap-3 mb-8">
               <BookOpen className="w-7 h-7 text-cyan" />
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter">HUB 1 – PAPER ASSESSMENT</h3>
            </div>

            {showWarning && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-bold flex items-center gap-2 animate-pulse">
                <AlertCircle className="w-5 h-5" /> {showWarning}
              </div>
            )}

            {!isSessionActive ? (
              <div className="flex flex-col items-center justify-center py-20">
                 <div className="bg-cyan/5 p-8 rounded-full mb-8"><Mic className="w-16 h-16 text-cyan" /></div>
                 <button onClick={startSessionFlow} className="bg-cyan text-slate-950 font-black px-16 py-6 rounded-2xl shadow-[0_0_30px_rgba(0,255,238,0.2)] hover:scale-105 transition-all uppercase tracking-[0.2em]">
                   INITIALIZE MISSION
                </button>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="w-16 h-16 text-cyan animate-spin mb-6" />
                <p className="text-xl font-black text-white uppercase tracking-widest">Generating Paper Question...</p>
              </div>
            ) : lastEval ? (
              <div className="space-y-8 animate-in zoom-in-95">
                <div className={`p-10 rounded-[32px] border-2 transition-all ${lastEval.isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <div className="flex items-center gap-6 mb-8">
                     {lastEval.isCorrect ? <CheckCircle2 className="w-16 h-16 text-emerald-500" /> : <XCircle className="w-16 h-16 text-red-500" />}
                     <h4 className={`text-6xl font-black ${lastEval.isCorrect ? 'text-emerald-500' : 'text-red-500'} tracking-tighter`}>{lastEval.isCorrect ? 'CORRECT' : 'WRONG'}</h4>
                  </div>
                  
                  {!lastEval.isCorrect && (
                    <div className="space-y-6">
                      <div className="bg-slate-950/80 p-8 rounded-2xl border-l-8 border-orange-500">
                        <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">OFFICIAL BOARD ANSWER:</span>
                        <p className="text-2xl font-black text-white mt-2 leading-tight">{lastEval.finalAnswer}</p>
                      </div>
                      <div className="bg-slate-950/40 p-8 rounded-2xl border border-slate-800">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">STEP-BY-STEP EXPLANATION:</span>
                        <p className="text-slate-200 font-medium leading-relaxed mt-4 whitespace-pre-wrap">{lastEval.explanation}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-10 pt-10 border-t border-slate-800 flex gap-4">
                    <button onClick={fetchQuestion} className="flex-1 bg-cyan text-slate-950 font-black py-5 rounded-2xl uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-transform">NEXT MISSION QUESTION</button>
                    <button onClick={() => setIsSessionActive(false)} className="px-8 bg-slate-900 text-white font-black py-5 rounded-2xl uppercase border border-slate-800">EXIT</button>
                  </div>
                </div>
              </div>
            ) : currentQuestion ? (
              <div className="space-y-8 animate-in slide-in-from-bottom-4">
                <div className="bg-slate-950/80 p-10 rounded-[40px] border border-slate-800 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Target className="w-12 h-12 text-cyan" /></div>
                  <span className="text-[10px] font-black text-cyan uppercase tracking-[0.3em] mb-4 block">EXAM QUESTION:</span>
                  <p className="text-4xl font-black text-white leading-[1.1] tracking-tighter">{currentQuestion}</p>
                </div>
                
                <div className="flex flex-col items-center gap-6 py-12 bg-slate-950/30 rounded-[40px] border border-slate-800">
                   <button onClick={startListening} disabled={isListening} className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 animate-pulse scale-110 shadow-[0_0_40px_rgba(239,68,68,0.4)]' : 'bg-cyan shadow-[0_0_40px_rgba(0,255,238,0.2)]'}`}>
                      {isListening ? <Volume2 className="w-14 h-14 text-white" /> : <Mic className="w-14 h-14 text-slate-950" />}
                   </button>
                   <span className="text-white font-black uppercase tracking-[0.5em] text-[10px]">{isListening ? 'LISTENING TO ANSWER...' : 'TAP TO SUBMIT ANSWER'}</span>
                   {transcript && <p className="text-slate-500 italic text-center px-12 text-sm bg-slate-900/50 py-3 rounded-xl border border-slate-800">Your Response: "{transcript}"</p>}
                </div>
              </div>
            ) : null}
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 md:p-10 shadow-2xl">
            <div className="flex items-center gap-3 mb-8"><Search className="w-7 h-7 text-emerald-400" /><h3 className="text-2xl font-black text-white uppercase tracking-tighter">HUB 2 – PAPER DOUBTS</h3></div>
            <form onSubmit={handleDoubtSearch} className="relative mb-8">
               <input type="text" value={doubtQuery} onChange={(e) => setDoubtQuery(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-5 pl-8 pr-32 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Type specific paper doubt..." />
               <button type="submit" disabled={isSearching} className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-500 text-slate-900 font-black px-8 py-3 rounded-xl text-xs uppercase tracking-widest">
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'RESOLVE'}
               </button>
            </form>
            {doubtResult && (
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-10 rounded-[40px] animate-in fade-in slide-in-from-top-4">
                 <p className="text-slate-200 text-xl leading-relaxed font-medium whitespace-pre-wrap">{doubtResult.text}</p>
                 {doubtResult.sources && doubtResult.sources.length > 0 && (
                   <div className="flex flex-wrap gap-3 mt-8 pt-8 border-t border-emerald-500/10">
                      {doubtResult.sources.map((s, i) => <a key={i} href={s.uri} target="_blank" className="bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-xl text-[10px] font-black text-slate-400 border border-slate-700 transition-colors flex items-center gap-2"><ExternalLink className="w-3 h-3 text-emerald-400" /> {s.title}</a>)}
                   </div>
                 )}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-[#010812] to-slate-900 border border-cyan/20 rounded-[40px] p-8 shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/5 blur-3xl rounded-full"></div>
             <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Activity className="w-4 h-4 text-cyan" /> PAPER PREDICTOR</h3>
             <div className={`text-5xl font-black mb-2 tracking-tighter ${prediction === 'FAIL RISK' ? 'text-red-500' : 'text-white'} group-hover:scale-110 transition-transform origin-left`}>{prediction}</div>
             <p className="text-slate-500 text-[10px] font-bold leading-relaxed uppercase tracking-widest">SSLC Board Probability Index</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 shadow-xl">
             <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Target className="w-4 h-4 text-orange-400" /> MISSION MASTERY</h3>
             <div className="h-[200px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profile.mastery ? Object.entries(profile.mastery).map(([name, value]) => ({ name, value })) : []}>
                    <XAxis dataKey="name" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#020b18', border: '1px solid #1e293b', borderRadius: '16px' }} />
                    <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                      {profile.mastery && Object.entries(profile.mastery).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Number(entry[1]) > 75 ? '#10b981' : Number(entry[1]) > 40 ? '#00ffee' : '#f43f5e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 text-center shadow-2xl">
             <div className="bg-cyan/5 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-cyan/10">
                <Trophy className="w-10 h-10 text-cyan" />
             </div>
             <h4 className="text-white font-black uppercase text-xl tracking-tighter mb-2">Discipline = Success</h4>
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">MindFlow Examiner v3.2</p>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-full z-[100] shadow-2xl">
         <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Board Paper Analysis Core Active
         </span>
      </footer>
    </div>
  );
};

export default App;
