
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Toast from './components/Toast';
import logoUrl from "./assets/logo.png";
import { SERVICES, GALLERY_IMAGES, LANDSCAPING_IMAGES, TESTIMONIALS, BUSINESS_INFO } from './constants';
import { CrewMember, Toast as ToastType } from './types';

// Supabase & Firebase Imports (Mocking for structural integrity)
import { supabase } from "@/supabaseClient.ts";
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';




interface User {
  email: string | null;
  [key: string]: any;
}


// --- Sub-Components ---

const AddCrewForm = ({ onAdd, isUploading }: { onAdd: (member: any, file: File | null) => void, isUploading: boolean }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && role && file) {
      onAdd({ name, role }, file);
      setName('');
      setRole('');
      setFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  return (
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Full Name
          </label>
          <input
              type="text"
              className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-xl outline-none focus:border-green-800 focus:bg-white transition-all shadow-inner"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              required
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Role
          </label>
          <input
              type="text"
              className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-xl outline-none focus:border-green-800 focus:bg-white transition-all shadow-inner"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="e.g. Lead Technician"
              required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Profile Picture
          </label>
          <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="w-full bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-2xl outline-none focus:border-green-800 hover:bg-slate-100 transition-all text-sm text-slate-500 file:mr-6 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#114f20] file:text-white hover:file:bg-green-900 cursor-pointer"
              onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
              required
          />
        </div>
        <button
            type="submit"
            disabled={isUploading}
            className="bg-[#114f20] text-white py-4 px-8 rounded-xl font-bold uppercase tracking-widest hover:bg-green-900 transition-all md:col-span-2 shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 group"
        >
          {isUploading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating Cloud Directory...
              </>
          ) : (
              <>
                <span>Add to Crew</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </>
          )}
        </button>
      </form>
  );
};

const AdminPanel = ({
                      user,
                      crewMembers,
                      onAdd,
                      onRemove,
                      onBack,
                      isUploading,
                      onLogin
                    }: {
  user: User | null,
  crewMembers: CrewMember[],
  onAdd: (member: any, file: File) => void,
  onRemove: (id: string, imageUrl: string) => void,
  onBack: () => void,
  isUploading: boolean,
  onLogin: () => void
}) => {
  return (
      <div className="min-h-screen bg-[#f8faf7] pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <button
              onClick={onBack}
              className="text-[#114f20] font-bold mb-10 flex items-center gap-3 group hover:text-green-900 transition-colors"
          >
            <div className="bg-white p-2 rounded-full shadow-sm group-hover:-translate-x-1 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
            </div>
            Back to Website
          </button>

          {!user ? (
              <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl text-center border border-slate-100 animate-on-load">
                <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <svg className="w-10 h-10 text-[#114f20]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h2 className="text-4xl font-serif font-bold text-[#114f20] mb-4">Admin Hub</h2>
                <p className="text-slate-500 mb-12 max-w-sm mx-auto">Authorized access only. Sign in to manage the Wilmington crew directory.</p>
                <button
                    onClick={onLogin}
                    className="flex items-center justify-center gap-4 w-full max-w-md mx-auto bg-white border-2 border-slate-100 py-4 px-8 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-green-800 transition-all shadow-lg active:scale-[0.98]"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                  Continue with Google
                </button>
              </div>
          ) : (
              <div className="space-y-12 animate-on-load">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h2 className="text-3xl font-serif font-bold text-[#114f20]">Add New Crew Member</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
                      </div>
                    </div>
                    <button
                        onClick={() => signOut(auth)}
                        className="bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 p-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Logout
                    </button>
                  </div>
                  <AddCrewForm onAdd={onAdd} isUploading={isUploading} />
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-serif font-bold text-[#114f20]">Database Roster</h2>
                    <span className="bg-green-50 text-[#114f20] text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                  {crewMembers.length} Members Total
                </span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {crewMembers.length === 0 ? (
                        <div className="py-16 text-center">
                          <p className="text-slate-400 italic">No crew members in database.</p>
                        </div>
                    ) : (
                        crewMembers.map(m => (
                            <div key={m.id} className="py-6 flex items-center justify-between group animate-on-load">
                              <div className="flex items-center gap-6">
                                <img
                                    src={m.imageUrl}
                                    className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-md group-hover:scale-105 transition-transform"
                                    alt={m.name}
                                />
                                <div>
                                  <p className="text-lg font-bold text-[#114f20] leading-tight">{m.name}</p>
                                  <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1 font-bold">{m.role}</p>
                                </div>
                              </div>
                              <button
                                  onClick={() => onRemove(m.id, m.imageUrl)}
                                  className="bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 p-3 rounded-xl transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                  title="Remove Member"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                              </button>
                            </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
  );
}

const App: React.FC = () => {
  const [route, setRoute] = useState<string>(window.location.hash || '#home');
  const [user, setUser] = useState<User | null>(null);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [toasts, setToasts] = useState<ToastType[]>([]);

  // Simple Router logic
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#home');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const addToast = useCallback((message: string, type: ToastType['type'] = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const fetchCrewMembers = async () => {
    try {
      const { data, error } = await supabase
          .from('ecms_crew')
          .select('*')
          .order('created_at', { ascending: false });

      if (error) throw error;

      const members = (data || []).map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        role: item.role,
        imageUrl: item.image_url
      })) as CrewMember[];

      setCrewMembers(members);
    } catch (error) {
      console.error('Error fetching crew members:', error);
      addToast('Failed to sync crew roster.', 'error');
    }
  };

  useEffect(() => {
    fetchCrewMembers();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      addToast('Authorized access granted.', 'success');
    } catch (error: any) {
      addToast(error.message || 'Authentication failed.', 'error');
    }
  };

  const handleAddMember = async (memberData: { name: string, role: string }, file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
          .from('ecms')
          .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
          .from('ecms')
          .getPublicUrl(fileName);

      const { error: dbError } = await supabase
          .from('ecms_crew')
          .insert([{
            name: memberData.name,
            role: memberData.role,
            image_url: publicUrl
          }]);

      if (dbError) throw dbError;

      addToast(`${memberData.name} added successfully!`, 'success');
      // CRITICAL: Re-fetch data immediately so it appears in the list
      await fetchCrewMembers();
    } catch (error: any) {
      addToast(error.message || 'Failed to update crew.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMember = async (id: string, imageUrl: string) => {
    if (!confirm('Remove this member from the directory?')) return;
    try {
      const { error: dbError } = await supabase
          .from('ecms_crew')
          .delete()
          .eq('id', id);

      if (dbError) throw dbError;
      addToast('Member removed.', 'success');
      await fetchCrewMembers();
    } catch (error: any) {
      addToast('Failed to remove member.', 'error');
    }
  };

  return (
      <div className="min-h-screen selection:bg-green-100 selection:text-green-900 overflow-x-hidden">
        <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-4">
          {toasts.map(toast => (
              <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>

        {route === '#crew' ? (
            <AdminPanel
                user={user}
                crewMembers={crewMembers}
                onAdd={handleAddMember}
                onRemove={handleRemoveMember}
                onBack={() => { window.location.hash = '#home'; }}
                isUploading={isUploading}
                onLogin={handleLogin}
            />
        ) : (
            <>
              <Navbar />

              <main>
                <Hero />

                <section id="services" className="py-24 bg-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                  <div className="container mx-auto px-6 relative">
                    <div className="text-center mb-16">
                      <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#114f20] mb-4">Quality Building Care</h2>
                      <p className="text-slate-500 max-w-2xl mx-auto">Precise commercial cleaning and maintenance across New Hanover County since 1974.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {SERVICES.map((service) => (
                          <div key={service.id} className="service-card p-10 rounded-3xl border border-slate-50 shadow-sm hover:shadow-xl group">
                            <div className="text-5xl mb-8 group-hover:scale-110 transition-transform inline-block">{service.icon}</div>
                            <h3 className="text-2xl font-bold text-[#114f20] mb-4">{service.title}</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">{service.description}</p>
                          </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section id="crew-section" className="py-32 bg-[#fdfdfd] border-t border-slate-50">
                  <div className="container mx-auto px-6 text-center">
                    <div className="mb-20">
                      <h2 className="text-4xl md:text-6xl font-serif font-bold text-[#114f20] mb-6">Meet The Crew!</h2>
                      <p className="text-lg text-slate-500 max-w-2xl mx-auto italic">Dedicated Wilmington neighbors treating your space like their own.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
                      {crewMembers.length === 0 ? (
                          <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">The Crew is coming soon!</p>
                          </div>
                      ) : (
                          crewMembers.map((member) => (
                              <div key={member.id} className="group relative">
                                <div className="relative mb-8 inline-block">
                                  <div className="w-64 h-64 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl group-hover:rounded-full transition-all duration-700">
                                    <img
                                        src={member.imageUrl}
                                        alt={member.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400'; }}
                                    />
                                  </div>
                                </div>
                                <h3 className="text-3xl font-serif font-bold text-[#114f20] mb-2">{member.name}</h3>
                                <p className="text-xs font-bold text-[#8a9a5b] uppercase tracking-[0.3em]">{member.role}</p>
                              </div>
                          ))
                      )}
                    </div>
                  </div>
                </section>

                {/* Cleaning & Interior Gallery */}
                <section className="py-24 bg-[#f4f7f2]">
                  <div className="container mx-auto px-6">
                    <div className="mb-12">
                      <h2 className="text-3xl font-serif font-bold text-[#114f20] mb-2">Interior & Office Cleaning</h2>
                      <p className="text-slate-600">Sparkling clean spaces for medical facilities and commercial offices.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {GALLERY_IMAGES.map((img, i) => (
                          <div key={i} className="group relative overflow-hidden rounded-xl aspect-square shadow-sm bg-slate-200">
                            <img
                                src={img.url}
                                alt={img.caption}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-[#114f20]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                              <p className="text-white text-[10px] font-bold uppercase tracking-widest">{img.caption}</p>
                            </div>
                          </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Landscaping & Grounds Gallery */}
                <section className="py-24 bg-white">
                  <div className="container mx-auto px-6">
                    <div className="mb-12 text-right">
                      <h2 className="text-3xl font-serif font-bold text-[#114f20] mb-2">Landscaping & Grounds</h2>
                      <p className="text-slate-600">Expert grounds care for Lumina Station and Greater Wilmington businesses.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {LANDSCAPING_IMAGES.map((img, i) => (
                          <div key={i} className="group relative overflow-hidden rounded-xl aspect-square shadow-sm bg-slate-200">
                            <img
                                src={img.url}
                                alt={img.caption}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-[#8a9a5b]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                              <p className="text-white text-[10px] font-bold uppercase tracking-widest">{img.caption}</p>
                            </div>
                          </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Google Reviews Section */}
                <section className="py-24 bg-[#f4f7f2]">
                  <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                      <div className="flex justify-center mb-4">
                        <div className="flex text-amber-400 gap-1">
                          {[1,2,3,4,5].map(i => <svg key={i} className="w-6 h-6 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                        </div>
                      </div>
                      <h2 className="text-3xl font-serif font-bold text-[#114f20]">What Our Neighbors Say</h2>
                      <p className="text-slate-500 mt-2">Verified Google Reviews from Wilmington Clients</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                      {TESTIMONIALS.map((t, i) => (
                          <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex text-amber-400 gap-0.5">
                                {[...Array(t.rating)].map((_, idx) => (
                                    <svg key={idx} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                ))}
                              </div>
                              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t.date}</span>
                            </div>
                            <p className="text-slate-600 italic mb-6 leading-relaxed">"{t.content}"</p>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#f4f7f2] rounded-full flex items-center justify-center font-bold text-[#114f20]">{t.author[0]}</div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">{t.author}</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">{t.location}</p>
                              </div>
                            </div>
                          </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Contact Form Section */}
                <section id="contact" className="py-24 bg-white scroll-mt-20">
                  <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col lg:flex-row">
                      <div className="lg:w-2/5 bg-[#114f20] p-12 text-white">
                        <h2 className="text-3xl font-serif font-bold mb-8 text-[#8a9a5b]">Contact Us</h2>
                        <div className="space-y-8">
                          <div>
                            <p className="text-xs uppercase tracking-widest font-bold text-[#8a9a5b] mb-2">Phone</p>
                            <a href={`tel:${BUSINESS_INFO.phone.replace(/\D/g,'')}`} className="text-2xl font-bold hover:text-[#8a9a5b] transition-colors">{BUSINESS_INFO.phone}</a>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-widest font-bold text-[#8a9a5b] mb-2">Office Address</p>
                            <p className="text-lg font-medium">{BUSINESS_INFO.subAddress}</p>
                            <p className="text-slate-300">{BUSINESS_INFO.address}<br/>{BUSINESS_INFO.cityStateZip}</p>
                          </div>
                        </div>
                      </div>
                      <div className="lg:w-3/5 p-12">
                        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                          <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-slate-400">Your Name</label>
                              <input type="text" className="w-full border-b-2 border-slate-100 py-3 focus:border-[#114f20] outline-none transition-colors" placeholder="Mary Wilmington" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-slate-400">Email Address</label>
                              <input type="email" className="w-full border-b-2 border-slate-100 py-3 focus:border-[#114f20] outline-none transition-colors" placeholder="mary@company.com" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-400">Message</label>
                            <textarea rows={4} className="w-full border-b-2 border-slate-100 py-3 focus:border-[#114f20] outline-none transition-colors resize-none" placeholder="Tell us about your needs..."></textarea>
                          </div>
                          <button className="w-full bg-[#114f20] text-white py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-green-900 transition-all shadow-lg">
                            Send Message
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </section>

              </main>

              <footer className="bg-slate-950 text-slate-500 py-24">
                <div className="container mx-auto px-6">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-16 mb-16">
                    <div>
                      <img src={logoUrl} alt="ECMS Logo" className="h-12 w-auto brightness-0 invert opacity-40 mb-8" />
                      <p className="text-sm max-w-xs leading-relaxed opacity-60">Professional building services for the Wilmington community since 1974.</p>
                    </div>
                    <div className="text-center md:text-right space-y-4">
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-white">Contact</p>
                      <a href={`tel:${BUSINESS_INFO.phone}`} className="block text-xl font-serif text-[#8a9a5b]">{BUSINESS_INFO.phone}</a>
                    </div>
                  </div>
                  <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">© 2026 {BUSINESS_INFO.name}.</p>
                    <div className="flex gap-8 items-center">
                      <button
                          onClick={() => { window.location.hash = '#crew'; }}
                          className="text-[10px] font-bold text-slate-700 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        Internal Admin Hub
                      </button>
                    </div>
                  </div>
                </div>
              </footer>
            </>
        )}
      </div>
  );
};

export default App;
