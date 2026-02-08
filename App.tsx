import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import logoUrl from "./assets/logo.png";
import { SERVICES, GALLERY_IMAGES, LANDSCAPING_IMAGES, TESTIMONIALS, BUSINESS_INFO } from './constants';
import { CrewMember } from './types';

// Firebase Imports
import { db, storage, auth, googleProvider } from './firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

// --- Components ---

const AddCrewForm = ({ onAdd, isUploading }: { onAdd: (member: any, file: File | null) => void, isUploading: boolean }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && role && file) {
      onAdd({ name, role }, file);
      // Reset form
      setName('');
      setRole('');
      setFile(null);
      // Reset file input visually
      (document.getElementById('file-upload') as HTMLInputElement).value = '';
    }
  };

  return (
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
          <input
              type="text"
              className="w-full bg-slate-50 border-b-2 border-slate-100 p-4 outline-none focus:border-green-800 transition-colors"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              required
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Role</label>
          <input
              type="text"
              className="w-full bg-slate-50 border-b-2 border-slate-100 p-4 outline-none focus:border-green-800 transition-colors"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="e.g. Lead Technician"
              required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Profile Picture</label>
          <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="w-full bg-slate-50 border-b-2 border-slate-100 p-4 outline-none focus:border-green-800 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
              required
          />
        </div>
        <button
            type="submit"
            disabled={isUploading}
            className="bg-[#114f20] text-white py-4 px-8 rounded-xl font-bold uppercase tracking-widest hover:bg-green-900 transition-all md:col-span-2 shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {isUploading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
          ) : 'Add to Crew'}
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
                      isUploading
                    }: {
  user: User | null,
  crewMembers: CrewMember[],
  onAdd: (member: any, file: File) => void,
  onRemove: (id: string) => void,
  onBack: () => void,
  isUploading: boolean
}) => {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in", error);
      alert("Error signing in. Check console.");
    }
  };

  const handleLogout = () => signOut(auth);

  return (
      <div className="min-h-screen bg-[#f4f7f2] pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <button
              onClick={onBack}
              className="text-[#114f20] font-bold mb-8 flex items-center gap-2 hover:translate-x-[-4px] transition-transform"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Website
          </button>

          {!user ? (
              <div className="bg-white p-12 rounded-3xl shadow-xl text-center border border-slate-100 animate-on-load">
                <h2 className="text-3xl font-serif font-bold text-[#114f20] mb-6">Admin Login</h2>
                <p className="text-slate-500 mb-10">Sign in to manage the crew directory</p>
                <button
                    onClick={handleLogin}
                    className="flex items-center justify-center gap-4 w-full max-w-md mx-auto bg-white border border-slate-200 py-4 px-8 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                  Sign in with Google
                </button>
              </div>
          ) : (
              <div className="space-y-12 animate-on-load">
                <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#114f20]">Add New Crew Member</h2>
                      <p className="text-xs text-slate-400 mt-1">Logged in as {user.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                  <AddCrewForm onAdd={onAdd} isUploading={isUploading} />
                </div>

                <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
                  <h2 className="text-2xl font-serif font-bold text-[#114f20] mb-8">Current Crew List</h2>
                  <div className="divide-y divide-slate-100">
                    {crewMembers.length === 0 ? (
                        <p className="py-8 text-center text-slate-400 italic">No crew members in database.</p>
                    ) : (
                        crewMembers.map(m => (
                            <div key={m.id} className="py-6 flex items-center justify-between group">
                              <div className="flex items-center gap-4">
                                <img
                                    src={m.imageUrl}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-[#8a9a5b]"
                                    alt={m.name}
                                />
                                <div>
                                  <p className="font-bold text-[#114f20]">{m.name}</p>
                                  <p className="text-xs text-slate-400 uppercase tracking-widest">{m.role}</p>
                                </div>
                              </div>
                              <button
                                  onClick={() => onRemove(m.id)}
                                  className="text-red-400 hover:text-red-600 p-2 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
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
  const [view, setView] = useState<'home' | 'admin'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Listen for Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. Listen for Database Updates (Real-time)
  useEffect(() => {
    const q = query(collection(db, "crew"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const members = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CrewMember[];
      setCrewMembers(members);
    });
    return () => unsubscribe();
  }, []);

  // 3. Handle Add (Upload Image -> Get URL -> Save to DB)
  const handleAddMember = async (memberData: { name: string, role: string }, file: File) => {
    if (!user) return alert("Please log in first");

    setIsUploading(true);
    try {
      // A. Upload Image to Firebase Storage
      const storageRef = ref(storage, `crew-images/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // B. Save Data to Firestore
      await addDoc(collection(db, "crew"), {
        name: memberData.name,
        role: memberData.role,
        imageUrl: downloadURL,
        createdAt: new Date()
      });

    } catch (error) {
      console.error("Error adding member:", error);
      alert("Failed to add member. Check console.");
    } finally {
      setIsUploading(false);
    }
  };

  // 4. Handle Remove (Delete from DB)
  const handleRemoveMember = async (id: string) => {
    if (!user) return;
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        await deleteDoc(doc(db, "crew", id));
      } catch (error) {
        console.error("Error deleting member:", error);
      }
    }
  };

  if (view === 'admin') {
    return (
        <AdminPanel
            user={user}
            crewMembers={crewMembers}
            onAdd={handleAddMember}
            onRemove={handleRemoveMember}
            onBack={() => setView('home')}
            isUploading={isUploading}
        />
    );
  }

  return (
      <div className="min-h-screen selection:bg-green-100 selection:text-green-900">
        <Navbar />

        <main>
          <Hero />

          {/* Services Section */}
          <section id="services" className="py-24 bg-white">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#114f20] mb-4">Building Service Contractor</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">Specializing in commercial office cleaning and property maintenance throughout New Hanover County.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {SERVICES.map((service) => (
                    <div key={service.id} className="service-card p-10 rounded-2xl border border-slate-100">
                      <div className="text-4xl mb-6">{service.icon}</div>
                      <h3 className="text-xl font-bold text-[#114f20] mb-4">{service.title}</h3>
                      <p className="text-slate-600 leading-relaxed text-sm">{service.description}</p>
                    </div>
                ))}
              </div>
            </div>
          </section>

          {/* Meet the Crew Section */}
          <section id="crew" className="py-24 bg-white border-t border-slate-50">
            <div className="container mx-auto px-6 text-center">
              <div className="mb-16">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#114f20] mb-4">Meet the Crew</h2>
                <p className="text-slate-500 max-w-2xl mx-auto italic">Our dedicated neighbors providing the best maintenance in Wilmington.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                {crewMembers.length === 0 ? (
                    <div className="col-span-full py-10 bg-slate-50 rounded-2xl">
                      <p className="text-slate-400 italic">Crew list is currently being updated...</p>
                      <button onClick={() => setView('admin')} className="text-sm font-bold text-[#114f20] mt-4 underline">Admin: Add Members</button>
                    </div>
                ) : (
                    crewMembers.map((member) => (
                        <div key={member.id} className="group">
                          <div className="relative mb-6 inline-block">
                            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-xl group-hover:border-[#8a9a5b] transition-all duration-500">
                              <img
                                  src={member.imageUrl}
                                  alt={member.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400'; }}
                              />
                            </div>
                          </div>
                          <h3 className="text-2xl font-serif font-bold text-[#114f20]">{member.name}</h3>
                          <p className="text-sm font-bold text-[#8a9a5b] uppercase tracking-widest mt-1">{member.role}</p>
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

        <footer className="bg-slate-950 text-slate-500 py-16">
          <div className="container mx-auto px-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12">
              <div>
                <img src={logoUrl} alt="ECMS Logo" className="h-10 w-auto brightness-0 invert opacity-30 mb-6 mx-auto md:mx-0" />
                <p className="text-sm max-w-xs leading-relaxed">East Coast Maintenance Service (ECMS). Serving the Wilmington business community since 1974.</p>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-right">
                <p className="mb-2 text-slate-300">Wilmington, NC</p>
                <p>© 2026 {BUSINESS_INFO.name}.</p>
                <button
                    onClick={() => setView('admin')}
                    className="mt-6 text-slate-800 hover:text-slate-400 transition-colors block ml-auto mr-0 underline underline-offset-4"
                >
                  Admin Access
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
  );
};

export default App;