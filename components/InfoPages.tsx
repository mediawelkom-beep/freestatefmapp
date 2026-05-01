
import React, { useState } from 'react';
import { Mail, Phone, Facebook, Instagram, Send, CheckCircle2, Globe, Radio, Headphones, Activity, Zap } from 'lucide-react';
import { CONTACT_INFO } from '../constants';

export const AboutUs: React.FC = () => (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-red/5 text-brand-red text-[10px] font-bold tracking-widest uppercase rounded-md">
          Established 1994
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-extrabold uppercase tracking-tight text-brand-dark leading-tight">Our<br /><span className="text-brand-red">Legacy.</span></h2>
        <div className="text-slate-500 space-y-4 leading-relaxed font-medium">
          <p>
            Free State FM Online Radio is a premier radio station based in Bloemfontein, South Africa.
          </p>
          <p>
            We are dedicated to providing the community with a wide range of content, including news, music, and entertainment. Our team is passionate about delivering high-quality programming that resonates with our audience.
          </p>
          <p>
            With a team of experienced professionals, we're dedicated to providing our listeners with the best possible digital experience 24/7.
          </p>
        </div>
      </div>
      <div className="relative group">
        <div className="absolute inset-x-4 -bottom-4 h-full bg-brand-red/10 rounded-[2.5rem] -z-10 group-hover:bg-brand-red/20 transition-colors" />
        <div className="rounded-[2.5rem] overflow-hidden shadow-2xl aspect-video lg:aspect-square border border-slate-100">
          <img src="https://images.unsplash.com/photo-1558403194-611308249627?q=80&w=2070&auto=format&fit=crop" alt="The Studio" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </div>
      </div>
    </div>
  </div>
);

export const ContactUs: React.FC = () => (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="max-w-2xl">
      <h2 className="text-4xl md:text-5xl font-display font-extrabold uppercase tracking-tight text-brand-dark mb-4 leading-tight">Get in<br /><span className="text-brand-red">Touch.</span></h2>
      <p className="text-slate-500 font-medium">Connect with our radio for requests, inquiries, or feedback.</p>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <a href={`mailto:${CONTACT_INFO.email}`} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-8 hover:border-brand-red transition-all group shadow-sm hover:shadow-xl hover:shadow-brand-red/5">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:bg-brand-red group-hover:text-white transition-all transform group-hover:-translate-y-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-brand-red/0 group-hover:bg-brand-red/10 transition-colors" />
          <Mail className="w-6 h-6 text-brand-red group-hover:text-white relative z-10" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Direct Frequency</p>
          <p className="font-bold text-lg text-brand-dark break-all">{CONTACT_INFO.email}</p>
        </div>
      </a>
      <a href={`tel:${CONTACT_INFO.phone}`} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-8 hover:border-brand-red transition-all group shadow-sm hover:shadow-xl hover:shadow-brand-red/5">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:bg-brand-red group-hover:text-white transition-all transform group-hover:-translate-y-1">
          <Phone className="w-6 h-6 text-brand-red group-hover:text-white" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Signal Line</p>
          <p className="font-bold text-lg text-brand-dark">{CONTACT_INFO.phone}</p>
        </div>
      </a>
    </div>

    <div className="flex flex-col items-center gap-8 pt-12 border-t border-slate-100">
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-2">Social Expansion</p>
        <p className="text-sm font-medium text-slate-500">Find our signals on external networks</p>
      </div>
      <div className="flex justify-center gap-8">
        <a href={CONTACT_INFO.social.facebook} target="_blank" rel="noopener noreferrer" className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center hover:bg-brand-red hover:text-white transition-all transform hover:scale-110 shadow-lg shadow-slate-100 group">
          <Facebook className="w-7 h-7 group-hover:animate-pulse" />
        </a>
        <a href={CONTACT_INFO.social.instagram} target="_blank" rel="noopener noreferrer" className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center hover:bg-brand-red hover:text-white transition-all transform hover:scale-110 shadow-lg shadow-slate-100 group">
          <Instagram className="w-7 h-7 group-hover:animate-pulse" />
        </a>
      </div>
    </div>
  </div>
);

export const Advertise: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-24 space-y-10 animate-in zoom-in-95 duration-500">
        <div className="flex justify-center">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20"></div>
            <div className="relative w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-4xl font-display font-extrabold uppercase tracking-tight text-brand-dark">Request Logged.</h3>
          <p className="text-slate-500 max-w-sm mx-auto text-lg">Our commercial broadcast team will establish contact via provided frequency shortly.</p>
        </div>
        <button onClick={() => setSubmitted(false)} className="px-10 py-4 bg-brand-red text-white font-bold uppercase text-[11px] tracking-[0.3em] rounded-full hover:bg-black transition-all shadow-xl shadow-brand-red/10">New Transmission</button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-12">
        <div className="space-y-6">
          <h2 className="text-4xl md:text-5xl font-display font-extrabold uppercase tracking-tight text-brand-dark leading-tight">Expand Your<br /><span className="text-brand-red">Influence.</span></h2>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">Grow your brand with Free State FM broadcast slots. Connect with thousands of engaged regional listeners daily through our high-fidelity digital stream.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
           {[
             { label: "Daily Reach", val: "15,000+ Listeners", icon: Radio },
             { label: "Active Engagement", val: "High Retention", icon: Activity },
             { label: "Digital Resolution", val: "HD Stream v2.0", icon: Globe },
           ].map(stat => (
             <div key={stat.label} className="flex items-center gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100 transition-transform hover:translate-x-2 group">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:text-brand-red transition-colors">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
                  <p className="font-bold text-brand-dark text-lg">{stat.val}</p>
                </div>
             </div>
           ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 md:p-12 bg-white rounded-[3rem] border border-slate-200 space-y-8 shadow-2xl relative">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand-red/5 rounded-full blur-2xl" />
        
        <div className="space-y-2">
          <h3 className="font-display font-bold text-xl text-brand-dark">Advertising Specs</h3>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Inquiry Form v1.0</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Company</label>
              <input required type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-brand-red focus:bg-white outline-none transition-all text-sm font-medium" placeholder="CYBERCORP LTD." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Name</label>
              <input required type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-brand-red focus:bg-white outline-none transition-all text-sm font-medium" placeholder="AGENT SMITH" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Digital Identifier (Email)</label>
            <input required type="email" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-brand-red focus:bg-white outline-none transition-all text-sm font-medium" placeholder="IDENTITY@NETWORK.COM" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mission Specs (Message)</label>
            <textarea required rows={3} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-brand-red focus:bg-white outline-none transition-all text-sm resize-none font-medium" placeholder="Describe your objectives..."></textarea>
          </div>

          <button type="submit" className="w-full py-5 bg-brand-red hover:bg-black text-white font-bold uppercase tracking-[0.4em] rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-red/20 active:scale-[0.98] group">
            <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            Establish Connection
          </button>
        </div>
      </form>
    </div>
  );
};
