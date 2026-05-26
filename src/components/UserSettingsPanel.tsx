import React, { useState } from "react";
import { User } from "../types";
import { useAuth } from "../lib/AuthContext";
import { 
  User as UserIcon, 
  Mail, 
  Key, 
  Trash2, 
  LogOut, 
  Sun, 
  Moon, 
  Camera, 
  CheckCircle, 
  AlertTriangle 
} from "lucide-react";

interface UserSettingsPanelProps {
  user: User | null;
  theme: "light" | "dark";
  onThemeToggle: (t: "light" | "dark") => void;
  onSaveToast: (msg: string, type?: "success" | "info" | "error") => void;
  onLogout: () => void;
}

const AVATARS = [
  { id: "analyst", emoji: "🕵️", name: "Forensic Analyst" },
  { id: "shield", emoji: "🛡️", name: "Security Guardian" },
  { id: "growth", emoji: "🚀", name: "Growth Director" },
  { id: "corporate", emoji: "💼", name: "Brand Executive" }
];

export default function UserSettingsPanel({ 
  user, 
  theme, 
  onThemeToggle, 
  onSaveToast, 
  onLogout 
}: UserSettingsPanelProps) {
  const { updateProfileName, changePassword, deleteAccount } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [selectedAvatar, setSelectedAvatar] = useState(localStorage.getItem("rs_avatar") || "analyst");
  
  // Changing Password Phase
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Deletion Phase
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (name.trim() === "") {
        onSaveToast("Profile name cannot be empty", "error");
        return;
      }
      await updateProfileName(name.trim());
      localStorage.setItem("rs_avatar", selectedAvatar);
      onSaveToast("Profile details updated successfully!", "success");
    } catch (err: any) {
      onSaveToast(err.message || "Failed to update profile", "error");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      onSaveToast("Password must be at least 6 characters long", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      onSaveToast("New passwords do not match", "error");
      return;
    }

    setIsChangingPass(true);
    try {
      await changePassword(oldPassword, newPassword);
      onSaveToast("Password changed successfully!", "success");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      onSaveToast(err.message || "Failed to change password. Re-authentication may be required.", "error");
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      onSaveToast("Account permanently deleted.", "info");
      onLogout();
    } catch (err: any) {
      setDeleteError(err.message || "This operation is sensitive and requires a recent login session.");
      onSaveToast("Re-authentication required prior to wiping database entries.", "error");
    }
  };

  const cardStyle = theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 text-slate-900";
  const inputStyle = theme === "dark" ? "bg-slate-950 border-slate-850 text-white focus:border-teal-400" : "bg-slate-50 border-slate-300 text-slate-950 focus:border-teal-500";
  const secondaryBtnStyle = theme === "dark" ? "bg-slate-950 hover:bg-slate-900 border-slate-850 text-slate-300" : "bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in font-sans">
      
      {/* Intro section */}
      <div>
        <h3 className="text-xl font-bold tracking-tight">Account Settings</h3>
        <p className="text-xs text-slate-500 mt-1">Manage profile credentials, custom user theme choices, password updates, and secure deletion options.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Details Block */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleUpdateProfile} className={`border rounded-2xl p-6 shadow-sm ${cardStyle}`}>
            <div className="flex items-center gap-2 mb-6">
              <UserIcon className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-mono text-teal-400 uppercase tracking-widest font-extrabold">1. Profile Information</span>
            </div>

            {/* Profile Avatar Selection */}
            <div className="mb-6">
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3">Choose Forensic Avatar</label>
              <div className="grid grid-cols-4 gap-3">
                {AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedAvatar === av.id 
                        ? "bg-teal-500/10 border-teal-500 text-teal-400 font-bold" 
                        : theme === "dark" ? "bg-slate-950 border-slate-850 text-slate-400 hover:text-white" : "bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-950"
                    }`}
                  >
                    <span className="text-2xl">{av.emoji}</span>
                    <span className="text-[9px] uppercase tracking-wider text-center">{av.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition-all ${inputStyle}`}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">Authorized Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs opacity-70 cursor-not-allowed ${inputStyle}`}
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block font-mono">EMail values configured by Google SSO or Signup credentials</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md transition-transform hover:scale-[1.01] cursor-pointer"
              >
                Save Details
              </button>
            </div>
          </form>

          {/* Change Password Block */}
          <form onSubmit={handleChangePassword} className={`border rounded-2xl p-6 shadow-sm ${cardStyle}`}>
            <div className="flex items-center gap-2 mb-6">
              <Key className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-mono text-teal-400 uppercase tracking-widest font-extrabold">2. Update Credentials</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">New Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition-all ${inputStyle}`}
                  required={newPassword.length > 0 || confirmPassword.length > 0}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition-all ${inputStyle}`}
                  required={newPassword.length > 0 || confirmPassword.length > 0}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isChangingPass}
                className="bg-slate-900 border border-slate-805 hover:bg-slate-850 px-5 py-2.5 rounded-xl text-xs font-extrabold text-white transition-all cursor-pointer"
              >
                {isChangingPass ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>

        {/* Action Widgets sidebar */}
        <div className="space-y-6">
          
          {/* Theme Toggler Card */}
          <div className={`border rounded-2xl p-6 shadow-sm ${cardStyle}`}>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-extrabold block mb-3">Workspace Mode</span>
            <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-1 border border-slate-850 rounded-xl">
              <button
                type="button"
                onClick={() => onThemeToggle("light")}
                className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  theme === "light" 
                    ? "bg-white text-slate-950 shadow" 
                    : "text-slate-400 hover:text-white bg-transparent"
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => onThemeToggle("dark")}
                className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border border-slate-800 text-teal-400 shadow-inner" 
                    : "text-slate-500 hover:text-slate-950 bg-transparent"
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Summary Card */}
          <div className={`border rounded-2xl p-6 shadow-sm ${cardStyle}`}>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-extrabold block mb-4">Security Overview</span>
            <div className="space-y-3 font-sans text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Security Clearance</span>
                <span className="font-bold text-emerald-400 uppercase tracking-wider font-mono text-[10px]">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Role</span>
                <span className="font-mono text-[10px] text-slate-300 font-bold uppercase">{user?.role || "user"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ingested Items</span>
                <span className="font-bold">{user?.id ? "Isolated" : "None"}</span>
              </div>
            </div>
            <div className="h-px bg-slate-850 my-4" />
            <button
              type="button"
              onClick={onLogout}
              className={`w-full py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center justify-center gap-2 border ${secondaryBtnStyle}`}
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Sign Out Session</span>
            </button>
          </div>

          {/* Destructive Delete Zone */}
          <div className="border border-rose-500/10 bg-rose-500/5 rounded-2xl p-6 shadow-sm">
            <span className="text-[9px] font-mono text-rose-400 uppercase tracking-widest font-extrabold block mb-2">Danger Zone</span>
            <p className="text-[11px] text-slate-500 leading-normal mb-4">Wipe your account record and cancel reputation audits forever.</p>
            
            {deleteError && (
              <p className="text-[10px] text-rose-400 leading-normal font-mono mb-3 p-2 bg-rose-950/20 rounded border border-rose-500/10">{deleteError}</p>
            )}

            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Product Account</span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-300 rounded-lg flex items-start gap-1.5 leading-normal">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>Are you absolutely sure? This action is irreversible. All your scanned reviews history and custom product suggestions stats will be purged permanently.</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="flex-1 py-2 bg-rose-650 hover:bg-rose-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-all text-center"
                  >
                    Yes, Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-805 text-slate-400 rounded-lg text-xs font-bold cursor-pointer transition-all text-center"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
