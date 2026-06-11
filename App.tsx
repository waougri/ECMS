import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Toast from "./components/Toast";
import logoUrl from "./assets/logo.png";
import {
  SERVICES,
  GALLERY_IMAGES,
  LANDSCAPING_IMAGES,
  TESTIMONIALS,
  BUSINESS_INFO,
} from "./constants";
import { CrewMember, Toast as ToastType } from "./types";

// Supabase & Firebase Imports
import { supabase } from "@/supabaseClient.ts";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { AnimatedBackground, Reveal } from "./components/AnimatedBackground";

// Extended User Interface
interface User {
  email: string | null;
  [key: string]: any;
}

// Extended Crew Member Type (Assuming you'll update types.ts, but extending here just in case)
type ExtendedCrewMember = CrewMember & { aboutMe?: string };

// --- Sub-Components ---

const AddCrewForm = ({
                       onAdd,
                       isUploading,
                     }: {
  onAdd: (member: { name: string; role: string; aboutMe: string }, file: File | null) => void;
  isUploading: boolean;
}) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && role) {
      onAdd({ name, role, aboutMe }, file);
      setName("");
      setRole("");
      setAboutMe("");
      setFile(null);
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }
  };

  return (
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            Full Name
          </label>
          <input
              type="text"
              className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-xl outline-none focus:border-green-800 focus:bg-white transition-all shadow-inner"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              required
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            Role
          </label>
          <input
              type="text"
              className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-xl outline-none focus:border-green-800 focus:bg-white transition-all shadow-inner"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Lead Technician"
              required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            About Me
          </label>
          <textarea
              className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-xl outline-none focus:border-green-800 focus:bg-white transition-all shadow-inner resize-none h-24"
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="A brief bio about the crew member..."
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            Profile Picture (Optional)
          </label>
          <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="w-full bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-2xl outline-none focus:border-green-800 hover:bg-slate-100 transition-all text-sm text-slate-500 file:mr-6 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#114f20] file:text-white hover:file:bg-green-900 cursor-pointer"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          />
          <p className="text-[10px] text-slate-400 italic mt-1">If left blank, a default avatar will be generated.</p>
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
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
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
                      onEdit,
                      onRemove,
                      onBack,
                      isUploading,
                      onLogin,
                    }: {
  user: User | null;
  crewMembers: ExtendedCrewMember[];
  onAdd: (member: any, file: File | null) => void;
  onEdit: (id: string, updatedData: any) => void;
  onRemove: (id: string, imageUrl: string) => void;
  onBack: () => void;
  isUploading: boolean;
  onLogin: () => void;
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ name: "", role: "", aboutMe: "" });

  const startEditing = (member: ExtendedCrewMember) => {
    setEditingId(member.id);
    setEditFormData({ name: member.name, role: member.role, aboutMe: member.aboutMe || "" });
  };

  const handleSaveEdit = (id: string) => {
    onEdit(id, editFormData);
    setEditingId(null);
  };

  return (
      <div className="min-h-screen bg-[#f8faf7] pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <button
              onClick={onBack}
              className="text-[#114f20] font-bold mb-10 flex items-center gap-3 group hover:text-green-900 transition-colors"
          >
            <div className="bg-white p-2 rounded-full shadow-sm group-hover:-translate-x-1 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            Back to Website
          </button>

          {!user ? (
              <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl text-center border border-slate-100 animate-on-load">
                <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <svg className="w-10 h-10 text-[#114f20]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
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
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
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
                        crewMembers.map((m) => (
                            <div key={m.id} className="py-6 flex flex-col md:flex-row md:items-center justify-between group animate-on-load gap-6">

                              {editingId === m.id ? (
                                  <div className="flex-1 w-full space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <input
                                          type="text"
                                          className="w-full bg-slate-50 p-3 rounded-xl border-2 border-transparent focus:border-green-800 outline-none transition-all"
                                          value={editFormData.name}
                                          onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                                          placeholder="Name"
                                      />
                                      <input
                                          type="text"
                                          className="w-full bg-slate-50 p-3 rounded-xl border-2 border-transparent focus:border-green-800 outline-none transition-all"
                                          value={editFormData.role}
                                          onChange={e => setEditFormData({...editFormData, role: e.target.value})}
                                          placeholder="Role"
                                      />
                                    </div>
                                    <textarea
                                        className="w-full bg-slate-50 p-3 rounded-xl border-2 border-transparent focus:border-green-800 outline-none transition-all resize-none h-20"
                                        value={editFormData.aboutMe}
                                        onChange={e => setEditFormData({...editFormData, aboutMe: e.target.value})}
                                        placeholder="About Me"
                                    />
                                    <div className="flex gap-3">
                                      <button onClick={() => handleSaveEdit(m.id)} className="bg-[#114f20] text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-900 transition-all">
                                        Save Changes
                                      </button>
                                      <button onClick={() => setEditingId(null)} className="bg-slate-200 text-slate-600 px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-300 transition-all">
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                              ) : (
                                  <>
                                    <div className="flex items-start gap-6 flex-1">
                                      <img
                                          src={m.imageUrl}
                                          className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-md group-hover:scale-105 transition-transform"
                                          alt={m.name}
                                      />
                                      <div>
                                        <p className="text-xl font-bold text-[#114f20] leading-tight">{m.name}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1 font-bold">{m.role}</p>
                                        {m.aboutMe && (
                                            <p className="text-sm text-slate-500 mt-2 line-clamp-2 max-w-lg leading-relaxed">
                                              {m.aboutMe}
                                            </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                          onClick={() => startEditing(m)}
                                          className="bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-xl transition-all shadow-sm font-bold text-xs uppercase tracking-widest"
                                      >
                                        Edit
                                      </button>
                                      <button
                                          onClick={() => onRemove(m.id, m.imageUrl)}
                                          className="bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 p-3 rounded-xl transition-all shadow-sm font-bold text-xs uppercase tracking-widest"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </>
                              )}
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
};

const App: React.FC = () => {
  const [route, setRoute] = useState<string>(window.location.hash || "#home");
  const [user, setUser] = useState<User | null>(null);
  const [crewMembers, setCrewMembers] = useState<ExtendedCrewMember[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [toasts, setToasts] = useState<ToastType[]>([]);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || "#home");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const addToast = useCallback(
      (message: string, type: ToastType["type"] = "info") => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { id, message, type }]);
      },
      [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const fetchCrewMembers = async () => {
    try {
      const { data, error } = await supabase
          .from("ecms_crew")
          .select("*")
          .order("created_at", { ascending: false });

      if (error) throw error;

      const members = (data || []).map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        role: item.role,
        aboutMe: item.about_me,
        imageUrl: item.image_url,
      })) as ExtendedCrewMember[];

      setCrewMembers(members);
    } catch (error) {
      console.error("Error fetching crew members:", error);
      addToast("Failed to sync crew roster.", "error");
    }
  };

  useEffect(() => {
    fetchCrewMembers();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      addToast("Authorized access granted.", "success");
    } catch (error: any) {
      addToast(error.message || "Authentication failed.", "error");
    }
  };

  const handleAddMember = async (
      memberData: { name: string; role: string; aboutMe: string },
      file: File | null,
  ) => {
    setIsUploading(true);
    try {
      // Create Default Avatar if no file is provided
      let finalImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          memberData.name
      )}&background=114f20&color=fff&size=256&font-size=0.4`;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from("ecms")
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("ecms").getPublicUrl(fileName);

        finalImageUrl = publicUrl;
      }

      const { error: dbError } = await supabase.from("ecms_crew").insert([
        {
          name: memberData.name,
          role: memberData.role,
          about_me: memberData.aboutMe,
          image_url: finalImageUrl,
        },
      ]);

      if (dbError) throw dbError;

      addToast(`${memberData.name} added successfully!`, "success");
      await fetchCrewMembers();
    } catch (error: any) {
      addToast(error.message || "Failed to update crew.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditMember = async (id: string, updatedData: { name: string; role: string; aboutMe: string }) => {
    try {
      const { error } = await supabase
          .from("ecms_crew")
          .update({
            name: updatedData.name,
            role: updatedData.role,
            about_me: updatedData.aboutMe,
          })
          .eq("id", id);

      if (error) throw error;

      addToast("Member updated successfully.", "success");
      await fetchCrewMembers();
    } catch (error: any) {
      addToast("Failed to update member.", "error");
    }
  };

  const handleRemoveMember = async (id: string, imageUrl: string) => {
    if (!confirm("Remove this member from the directory?")) return;
    try {
      const { error: dbError } = await supabase
          .from("ecms_crew")
          .delete()
          .eq("id", id);

      if (dbError) throw dbError;
      addToast("Member removed.", "success");
      await fetchCrewMembers();
    } catch (error: any) {
      addToast("Failed to remove member.", "error");
    }
  };

  return (
      <div className="min-h-screen selection:bg-green-100 selection:text-green-900 overflow-x-hidden">
        <AnimatedBackground />
        <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-4">
          {toasts.map((toast) => (
              <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>

        {route === "#crew" ? (
            <AdminPanel
                user={user}
                crewMembers={crewMembers}
                onAdd={handleAddMember}
                onEdit={handleEditMember}
                onRemove={handleRemoveMember}
                onBack={() => {
                  window.location.hash = "#home";
                }}
                isUploading={isUploading}
                onLogin={handleLogin}
            />
        ) : (
            <>
              <Navbar />

              <main>
                <Hero />

                <section
                    id="services"
                    className="py-24 bg-white/90 backdrop-blur-sm relative overflow-hidden"
                >
                  <Reveal>
                    <div className="container mx-auto px-6 relative">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {SERVICES.map((service) => (
                            <div
                                key={service.id}
                                className="service-card p-10 rounded-3xl border border-slate-50 shadow-sm hover:shadow-xl group bg-white relative overflow-hidden transition-all hover:-translate-y-2"
                            >
                              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine" />

                              <div className="text-5xl mb-8 group-hover:scale-110 transition-transform inline-block">
                                {service.icon}
                              </div>
                              <h3 className="text-2xl font-bold text-[#114f20] mb-4">
                                {service.title}
                              </h3>
                              <p className="text-slate-600 leading-relaxed text-sm">
                                {service.description}
                              </p>
                            </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                </section>

                <section
                    id="crew-section"
                    className="py-32 bg-[#fdfdfd] border-t border-slate-50"
                >
                  <Reveal >
                    <div className="container mx-auto px-6 text-center">
                      <div className="mb-20">
                        <h2 className="text-4xl md:text-6xl font-serif font-bold text-[#114f20] mb-6">
                          Meet The Crew!
                        </h2>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto italic">
                          Dedicated Wilmington neighbors treating your space like
                          their own.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                        {crewMembers.length === 0 ? (
                            <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">
                                The Crew is coming soon!
                              </p>
                            </div>
                        ) : (
                            crewMembers.map((member) => (
                                <div key={member.id} className="group relative flex flex-col items-center">
                                  <div className="relative mb-8 inline-block">
                                    <div className="w-64 h-64 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl group-hover:rounded-full transition-all duration-700">
                                      <img
                                          src={member.imageUrl}
                                          alt={member.name}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400";
                                          }}
                                      />
                                    </div>
                                  </div>
                                  <h3 className="text-3xl font-serif font-bold text-[#114f20] mb-2">
                                    {member.name}
                                  </h3>
                                  <p className="text-xs font-bold text-[#8a9a5b] uppercase tracking-[0.3em] mb-4">
                                    {member.role}
                                  </p>
                                  {member.aboutMe && (
                                      <p className="text-slate-600 text-sm max-w-sm mx-auto leading-relaxed opacity-90">
                                        {member.aboutMe}
                                      </p>
                                  )}
                                </div>
                            ))
                        )}
                      </div>
                    </div>
                  </Reveal>
                </section>

                {/* Cleaning & Interior Gallery */}
                <section className="py-24 bg-[#f4f7f2]">
                  <Reveal >
                    <div className="container mx-auto px-6">
                      <div className="mb-12">
                        <h2 className="text-3xl font-serif font-bold text-[#114f20] mb-2">
                          Interior & Office Cleaning
                        </h2>
                        <p className="text-slate-600">
                          Sparkling clean spaces for medical facilities and
                          commercial offices.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" hidden>
                        {}
                      </div>
                    </div>
                  </Reveal>
                </section>

                {/* Landscaping & Grounds Gallery */}
                <section className="py-24 bg-white">
                  <Reveal >
                    <div className="container mx-auto px-6">
                      <div className="mb-12 text-right">
                        <h2 className="text-3xl font-serif font-bold text-[#114f20] mb-2">
                          Landscaping & Grounds
                        </h2>
                        <p className="text-slate-600">
                          Expert grounds care for Lumina Station and Greater
                          Wilmington businesses.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {}
                      </div>
                    </div>
                  </Reveal>
                </section>

                {/* Google Reviews Section */}
                <section className="py-24 bg-[#f4f7f2]">
                  <Reveal >
                    <div className="container mx-auto px-6">
                      <div className="text-center mb-16">
                        <div className="flex justify-center mb-4">
                          <div className="flex text-amber-400 gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <svg
                                    key={i}
                                    className="w-6 h-6 fill-current"
                                    viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                          </div>
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-[#114f20]">
                          What Our Neighbors Say
                        </h2>
                        <p className="text-slate-500 mt-2">
                          Verified Google Reviews from Wilmington Clients
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {TESTIMONIALS.map((t, i) => (
                            <div
                                key={i}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex text-amber-400 gap-0.5">
                                  {[...Array(t.rating)].map((_, idx) => (
                                      <svg
                                          key={idx}
                                          className="w-4 h-4 fill-current"
                                          viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                  ))}
                                </div>
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                            {t.date}
                          </span>
                              </div>
                              <p className="text-slate-600 italic mb-6 leading-relaxed">
                                "{t.content}"
                              </p>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#f4f7f2] rounded-full flex items-center justify-center font-bold text-[#114f20]">
                                  {t.author[0]}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-800">
                                    {t.author}
                                  </p>
                                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                                    {t.location}
                                  </p>
                                </div>
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                </section>


                {/* Contact Form Section */}
                <section id="contact" className="py-24 bg-white scroll-mt-20">
                  <Reveal children={undefined}>

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
                  </Reveal>
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
