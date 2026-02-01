
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  systemContext: string;
}

// Audio Utilities
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, systemContext }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string, sources?: any[]}[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [transcription, setTranscription] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live API Refs
  const audioContextsRef = useRef<{input: AudioContext, output: AudioContext} | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, transcription]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputText('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: `You are the iMATOMs Pro - Ver 3.1.1 AI Analytics. You assist hospital engineers and staff. Current system context: ${systemContext}. Use grounding if needed for technical standards.`,
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text || "I couldn't process that request.";
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

      setMessages(prev => [...prev, { role: 'ai', text, sources }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: "Error: Could not connect to the neural core." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startLiveSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextsRef.current = { input: inputCtx, output: outputCtx };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000'
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            setIsLiveActive(true);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
            }
            if (message.serverContent?.turnComplete) {
              setTranscription('');
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => setIsLiveActive(false),
          onerror: () => setIsLiveActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are the iMATOMs Ver 3.1 AI Voice Assistant. Respond concisely. Current context: ${systemContext}`,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          outputAudioTranscription: {}
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
    }
  };

  const stopLiveSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsLiveActive(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#0a0e17] border-l border-cyan-500/20 z-[100] flex flex-col shadow-2xl animate-slideLeft">
      <div className="p-6 border-b border-cyan-500/10 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <i className="fa-solid fa-brain animate-pulse"></i>
          </div>
          <div>
            <h2 className="font-display text-sm font-bold text-white uppercase tracking-widest">AI Assistant Analytics</h2>
            <div className="flex items-center gap-1.5">
               <span className={`w-1.5 h-1.5 rounded-full ${isLiveActive ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
               <span className="text-[9px] text-white/40 uppercase font-black">{isLiveActive ? 'Live Voice Active' : 'AI Live Ready'}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
              m.role === 'user' 
              ? 'bg-cyan-600 text-white rounded-tr-none' 
              : 'bg-white/5 border border-white/10 text-white/80 rounded-tl-none'
            }`}>
              {m.text}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
                  <p className="text-[9px] uppercase font-black text-cyan-400">Sources:</p>
                  {m.sources.map((chunk, idx) => (
                    chunk.web && (
                      <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="block text-[10px] text-white/40 hover:text-cyan-400 truncate">
                        <i className="fa-solid fa-link mr-1"></i> {chunk.web.title || chunk.web.uri}
                      </a>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 p-4 rounded-2xl animate-pulse flex gap-1">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
            </div>
          </div>
        )}
        {transcription && (
          <div className="flex justify-start">
            <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-xl italic text-xs text-cyan-400/80">
              {transcription}...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-black/60 border-t border-white/5">
        <div className="flex gap-2">
          <button 
            onClick={isLiveActive ? stopLiveSession : startLiveSession}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              isLiveActive ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-white/5 text-cyan-400 border border-white/10'
            }`}
          >
            <i className={`fa-solid ${isLiveActive ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
          </button>
          <form onSubmit={sendMessage} className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Ask the neural core..." 
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:border-cyan-500/50 outline-none pr-12"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLiveActive}
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400">
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>
        <p className="text-[8px] text-white/70 uppercase text-center mt-3 tracking-widest">
          Integrated with Gemini Flash Neural Engine
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slideLeft { animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
};

export default AIAssistant;
