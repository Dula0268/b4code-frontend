"use client";

import { useState, useEffect } from "react";
import { ownerMessageApi, StaffQuickReplyDto } from "@/api/owner/owner-message.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit2, Save, X, Bot, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function StaffQuickReplyClient({ propertyId }: { propertyId: number }) {
  const [rules, setRules] = useState<StaffQuickReplyDto[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for new/editing rule
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchRules = async () => {
    if (!propertyId) return;
    try {
      const data = await ownerMessageApi.getStaffQuickReplies(propertyId);
      setRules(data);
    } catch (error) {
      console.error("Failed to load staff quick replies", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId) {
      fetchRules();
    }
  }, [propertyId]);

  const handleSave = async () => {
    if (!propertyId || !message.trim() || !name.trim()) return;

    try {
      const payload = {
        name: name,
        message: message,
        isActive: true,
      };

      if (editingId) {
        await ownerMessageApi.updateStaffQuickReply(propertyId, editingId, payload);
      } else {
        await ownerMessageApi.createStaffQuickReply(propertyId, payload);
      }

      setName("");
      setMessage("");
      setEditingId(null);
      setIsCreating(false);
      fetchRules();
    } catch (error) {
      console.error("Failed to save quick reply", error);
    }
  };

  const handleToggle = async (rule: StaffQuickReplyDto) => {
    if (!propertyId) return;
    
    // Optimistic UI update
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, isActive: !r.isActive } : r));

    try {
      const payload = {
        name: rule.name,
        message: rule.message,
        isActive: !rule.isActive,
      };

      await ownerMessageApi.updateStaffQuickReply(propertyId, rule.id, payload);
    } catch (error) {
      console.error("Failed to toggle rule", error);
      // Revert on error
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, isActive: rule.isActive } : r));
    }
  };

  const handleDelete = async (id: number) => {
    if (!propertyId) return;
    
    if (confirm("Are you sure you want to delete this quick reply?")) {
      try {
        await ownerMessageApi.deleteStaffQuickReply(propertyId, id);
        fetchRules();
      } catch (error) {
        console.error("Failed to delete quick reply", error);
      }
    }
  };

  const startEdit = (rule: StaffQuickReplyDto) => {
    setEditingId(rule.id);
    setName(rule.name);
    setMessage(rule.message);
    setIsCreating(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setMessage("");
    setIsCreating(false);
  };

  if (loading) return <div>Loading quick replies...</div>;

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start mt-6">
      {/* Left side: Form */}
      <div className="bg-white rounded-2xl border border-[#eadfce] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center text-[var(--brand-primary)]">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{editingId ? "Edit Quick Reply" : "New Quick Reply"}</h2>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Keyword / Button Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Room Cleaned"
              className="w-full bg-white border-slate-200 focus-visible:ring-[#9a3300] focus-visible:border-[#9a3300]"
            />
            <p className="text-xs text-slate-500 mt-1">This short name will appear on the button.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Message Template</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. The room has been cleaned and is ready."
              className="w-full min-h-[100px] p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            />
            <p className="text-xs text-slate-500 mt-1">This is the actual message that will be sent.</p>
          </div>
          <div className="flex gap-2 justify-start pt-4">
            <Button 
              onClick={handleSave}
              disabled={!message.trim() || !name.trim()}
              className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white"
            >
              <Save size={16} className="mr-2" /> {editingId ? "Save Changes" : "Save Reply"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={cancelEdit}>
                <X size={16} className="mr-2" /> Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Right side: List */}
      <div className="bg-[#fafafa] border border-[#eadfce] rounded-2xl p-6 hidden lg:block">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg text-[#9a3300]">Active Quick Replies</h3>
        </div>
        
        <div className="space-y-4">
          {rules.length === 0 && !isCreating && (
            <div className="text-center p-8 text-[#8b7d6d] border border-dashed border-[#eadfce] rounded-xl">
              No staff quick replies configured yet.
            </div>
          )}
          
          {rules.map((rule) => (
            <div key={rule.id} className="bg-white p-5 rounded-xl border border-[#2d2116] shadow-sm flex items-center justify-between">
              <div className="flex-1 mr-4">
                <h4 className="text-2xl font-medium text-[#001b3a]">{rule.name}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{rule.message}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${rule.isActive ? "bg-green-500" : "bg-slate-300"}`} />
                  <span className="text-xs text-slate-600 mr-2">{rule.isActive ? "Active" : "Paused"}</span>
                  <Switch 
                    checked={rule.isActive}
                    onCheckedChange={() => handleToggle(rule)}
                    className="data-[state=checked]:bg-[#9a3300] data-[state=unchecked]:bg-[#d4c9bc]"
                  />
                </div>
                <div className="flex items-center gap-1 border-l border-slate-200 pl-4">
                  <button 
                    onClick={() => startEdit(rule)}
                    className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(rule.id)}
                    className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
