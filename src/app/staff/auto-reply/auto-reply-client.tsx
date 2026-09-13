"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth/auth.store";
import { staffApi } from "@/api/staff/staff.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit2, Save, X, Power, Bot } from "lucide-react";
import { Switch } from "@/components/ui/switch"; // Assuming standard UI switch component exists, if not I will use a simple checkbox/toggle

interface AutoReplyRule {
  id: number;
  keyword: string;
  replyMessage: string;
  isActive: boolean;
}

export default function AutoReplyClient({ propertyId: propsPropertyId }: { propertyId?: number } = {}) {
  const user = useAuthStore((state) => state.user);
  const [rules, setRules] = useState<AutoReplyRule[]>([]);
  const [loading, setLoading] = useState(true);
  
  const activePropertyId = propsPropertyId || user?.propertyId;
  
  // State for new/editing rule
  const [editingId, setEditingId] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchRules = async () => {
    if (!activePropertyId || !user?.role) return;
    try {
      const data = await staffApi.getAutoReplyRules(activePropertyId, user.role);
      setRules(data);
    } catch (error) {
      console.error("Failed to load rules", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activePropertyId) {
      fetchRules();
    }
  }, [activePropertyId]);

  const handleSave = async () => {
    if (!activePropertyId || !keyword.trim() || !replyMessage.trim() || !user?.role) return;

    try {
      const payload = {
        keyword: keyword,
        replyMessage,
        isActive: true,
        targetRole: user.role.toUpperCase()
      };

      if (editingId) {
        await staffApi.updateAutoReplyRule(activePropertyId, editingId, payload);
      } else {
        await staffApi.createAutoReplyRule(activePropertyId, payload);
      }

      setKeyword("");
      setReplyMessage("");
      setEditingId(null);
      setIsCreating(false);
      fetchRules();
    } catch (error) {
      console.error("Failed to save rule", error);
    }
  };

  const handleToggle = async (rule: AutoReplyRule) => {
    if (!activePropertyId || !user?.role) return;
    
    // Optimistic UI update
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, isActive: !r.isActive } : r));

    try {
      const payload = {
        keyword: rule.keyword,
        replyMessage: rule.replyMessage,
        isActive: !rule.isActive,
        targetRole: user.role
      };

      await staffApi.updateAutoReplyRule(activePropertyId, rule.id, payload);
      // fetchRules() happens in background or we can just rely on optimistic update
    } catch (error) {
      console.error("Failed to toggle rule", error);
      // Revert on error
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, isActive: rule.isActive } : r));
    }
  };

  const handleDelete = async (id: number) => {
    if (!activePropertyId) return;
    
    if (confirm("Are you sure you want to delete this auto-reply rule?")) {
      try {
        await staffApi.deleteAutoReplyRule(activePropertyId, id);
        fetchRules();
      } catch (error) {
        console.error("Failed to delete rule", error);
      }
    }
  };

  const startEdit = (rule: AutoReplyRule) => {
    setEditingId(rule.id);
    setKeyword(rule.keyword);
    setReplyMessage(rule.replyMessage);
    setIsCreating(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setKeyword("");
    setReplyMessage("");
    setIsCreating(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Left side: Form */}
      <div className="bg-white rounded-2xl border border-[#eadfce] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-[#9a3300]/10 flex items-center justify-center text-[#9a3300]">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2d2116]">{editingId ? "Edit Rule" : "New Rule"}</h2>
          </div>
        </div>
        
        <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6f6254] mb-1">Keyword</label>
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. wifi, towels, checkout"
                className="bg-white"
              />
              <p className="text-xs text-[#8b7d6d] mt-1">When a guest message contains this exact word, the auto-reply will trigger.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6f6254] mb-1">Auto-Reply Message</label>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type the message to send automatically..."
                className="w-full min-h-[100px] p-3 rounded-xl border border-[#eadfce] focus:outline-none focus:ring-2 focus:ring-[#9a3300]"
              />
            </div>
            <div className="flex gap-2 justify-start pt-4">
              <Button 
                onClick={handleSave}
                disabled={!keyword.trim() || !replyMessage.trim()}
                className="bg-[#9a3300] hover:bg-[#7a2800] text-white"
              >
                <Save size={16} className="mr-2" /> {editingId ? "Save Changes" : "Save Rule"}
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
          <h3 className="font-semibold text-lg text-[#9a3300]">Active Rules</h3>
        </div>
        
        <div className="space-y-4">
        {rules.length === 0 && !isCreating && (
          <div className="text-center p-8 text-[#8b7d6d] border border-dashed border-[#eadfce] rounded-xl">
            No auto-reply rules configured yet.
          </div>
        )}
        
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white p-5 rounded-xl border border-[#2d2116] shadow-sm flex items-center justify-between">
            <div className="flex-1 mr-4">
              <h4 className="text-2xl font-medium text-[#001b3a]">{rule.keyword}</h4>
              <p className="text-xs text-slate-500 mt-1">Trigger: On Keyword Match</p>
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
