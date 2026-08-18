"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth/auth.store";
import { staffApi } from "@/api/staff/staff.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit2, Save, X, Power } from "lucide-react";
import { Switch } from "@/components/ui/switch"; // Assuming standard UI switch component exists, if not I will use a simple checkbox/toggle

interface AutoReplyRule {
  id: number;
  keyword: string;
  replyMessage: string;
  isActive: boolean;
}

export default function AutoReplyClient() {
  const user = useAuthStore((state) => state.user);
  const [rules, setRules] = useState<AutoReplyRule[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for new/editing rule
  const [editingId, setEditingId] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchRules = async () => {
    if (!user?.propertyId) return;
    try {
      const data = await staffApi.getAutoReplyRules(user.propertyId);
      setRules(data);
    } catch (error) {
      console.error("Failed to load rules", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.propertyId) {
      fetchRules();
    }
  }, [user?.propertyId]);

  const handleSave = async () => {
    if (!user?.propertyId || !keyword.trim() || !replyMessage.trim()) return;

    try {
      const payload = {
        keyword: keyword,
        replyMessage,
        isActive: true
      };

      if (editingId) {
        await staffApi.updateAutoReplyRule(user.propertyId, editingId, payload);
      } else {
        await staffApi.createAutoReplyRule(user.propertyId, payload);
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
    if (!user?.propertyId) return;
    
    try {
      const payload = {
        keyword: rule.keyword,
        replyMessage: rule.replyMessage,
        isActive: !rule.isActive
      };

      await staffApi.updateAutoReplyRule(user.propertyId, rule.id, payload);
      fetchRules();
    } catch (error) {
      console.error("Failed to toggle rule", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!user?.propertyId) return;
    
    if (confirm("Are you sure you want to delete this auto-reply rule?")) {
      try {
        await staffApi.deleteAutoReplyRule(user.propertyId, id);
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
    <div className="bg-white rounded-2xl border border-[#eadfce] p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#2d2116]">Active Rules</h2>
        {!isCreating && !editingId && (
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-[#9a3300] hover:bg-[#7a2800] text-white"
          >
            <Plus size={16} className="mr-2" /> Add Rule
          </Button>
        )}
      </div>

      {(isCreating || editingId) && (
        <div className="bg-[#fafafa] p-4 rounded-xl border border-[#eadfce] mb-6">
          <h3 className="font-bold text-[#2d2116] mb-4">
            {editingId ? "Edit Rule" : "New Rule"}
          </h3>
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
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={cancelEdit}>
                <X size={16} className="mr-2" /> Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!keyword.trim() || !replyMessage.trim()}
                className="bg-[#9a3300] hover:bg-[#7a2800] text-white"
              >
                <Save size={16} className="mr-2" /> Save Rule
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {rules.length === 0 && !isCreating && (
          <div className="text-center p-8 text-[#8b7d6d] border border-dashed border-[#eadfce] rounded-xl">
            No auto-reply rules configured yet.
          </div>
        )}
        
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-start justify-between p-4 border border-[#eadfce] rounded-xl hover:bg-[#fafafa] transition-colors">
            <div className="flex-1 mr-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#f4eee6] text-[#9a3300] px-2 py-1 rounded-md text-xs font-bold uppercase">
                  Keyword: {rule.keyword}
                </span>
                {!rule.isActive && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md font-medium">Inactive</span>
                )}
              </div>
              <p className="text-[#2d2116] text-sm whitespace-pre-wrap">{rule.replyMessage}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleToggle(rule)}
                className={`p-2 rounded-lg transition-colors ${rule.isActive ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}
                title={rule.isActive ? "Turn Off" : "Turn On"}
              >
                <Power size={18} />
              </button>
              <button 
                onClick={() => startEdit(rule)}
                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => handleDelete(rule.id)}
                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
