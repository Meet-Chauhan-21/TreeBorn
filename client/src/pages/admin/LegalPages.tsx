import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/admin/Button';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

interface LegalSection {
  title: string;
  content: string[];
}

export const LegalPages: React.FC = () => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');
  
  const [privacyPolicy, setPrivacyPolicy] = useState<LegalSection[]>([]);
  const [termsConditions, setTermsConditions] = useState<LegalSection[]>([]);

  useEffect(() => {
    const fetchLegalData = async () => {
      if (!accessToken) return;
      try {
        const response = await fetch(`${API_BASE_URL}/admin/settings`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            setPrivacyPolicy(data.settings.privacyPolicy || []);
            setTermsConditions(data.settings.termsConditions || []);
          }
        }
      } catch (error) {
        console.error('Error fetching legal data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLegalData();
  }, [accessToken]);

  const handleSave = async () => {
    if (!accessToken) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          privacyPolicy,
          termsConditions
        })
      });

      if (response.ok) {
        toast.success('Legal pages updated successfully');
      } else {
        toast.error('Failed to update legal pages');
      }
    } catch (error) {
      console.error('Error saving legal pages:', error);
      toast.error('Failed to update legal pages');
    } finally {
      setSaving(false);
    }
  };

  const getActiveList = () => {
    return activeTab === 'privacy' ? privacyPolicy : termsConditions;
  };

  const setActiveList = (val: LegalSection[]) => {
    if (activeTab === 'privacy') {
      setPrivacyPolicy(val);
    } else {
      setTermsConditions(val);
    }
  };

  const addTopic = () => {
    const list = [...getActiveList()];
    list.push({ title: 'New Topic Section', content: [''] });
    setActiveList(list);
  };

  const removeTopic = (sIdx: number) => {
    const list = getActiveList().filter((_, idx) => idx !== sIdx);
    setActiveList(list);
  };

  const changeTopicTitle = (sIdx: number, val: string) => {
    const list = [...getActiveList()];
    list[sIdx].title = val;
    setActiveList(list);
  };

  const addParagraph = (sIdx: number) => {
    const list = [...getActiveList()];
    list[sIdx].content.push('');
    setActiveList(list);
  };

  const changeParagraph = (sIdx: number, pIdx: number, val: string) => {
    const list = [...getActiveList()];
    list[sIdx].content[pIdx] = val;
    setActiveList(list);
  };

  const removeParagraph = (sIdx: number, pIdx: number) => {
    const list = [...getActiveList()];
    list[sIdx].content = list[sIdx].content.filter((_, idx) => idx !== pIdx);
    setActiveList(list);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pt-2 font-sans pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Legal Pages Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">Configure structured sections and lines for dynamic Privacy Policy and Terms & Conditions pages</p>
          </div>
          <Button 
            icon={Save} 
            size="sm" 
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 cursor-pointer transition-all duration-150 ${
              activeTab === 'privacy'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 cursor-pointer transition-all duration-150 ${
              activeTab === 'terms'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Terms & Conditions
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-slate-200/80">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {getActiveList().map((section, sIdx) => (
              <div 
                key={sIdx} 
                className="bg-white border border-slate-200 rounded-2xl p-5 relative shadow-2xs space-y-4 hover:border-slate-300 transition-all duration-150"
              >
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Topic Title
                    </label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => changeTopicTitle(sIdx, e.target.value)}
                      placeholder="e.g., 1. User Account Registration"
                      className="w-full bg-transparent font-semibold text-slate-800 text-base focus:outline-none focus:border-indigo-500 border-b border-transparent focus:pb-0.5"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTopic(sIdx)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                    title="Remove Topic Section"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Content Lines / Paragraphs
                  </label>
                  {section.content.map((para, pIdx) => (
                    <div key={pIdx} className="flex gap-2 items-start group">
                      <textarea
                        value={para}
                        onChange={(e) => changeParagraph(sIdx, pIdx, e.target.value)}
                        placeholder="Enter paragraph text..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 min-h-[70px] resize-y"
                      />
                      <button
                        type="button"
                        onClick={() => removeParagraph(sIdx, pIdx)}
                        disabled={section.content.length === 1}
                        className="p-2 mt-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Delete line"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => addParagraph(sIdx)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-650 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Paragraph Line</span>
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addTopic}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 rounded-2xl py-4 transition-all duration-150 cursor-pointer text-slate-500 hover:text-indigo-600 text-sm font-semibold"
            >
              <PlusCircle size={18} />
              <span>Add New Topic Section</span>
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default LegalPages;
