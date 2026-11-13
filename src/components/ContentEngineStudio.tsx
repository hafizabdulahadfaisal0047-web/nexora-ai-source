import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Search,
  Copy,
  Check,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Flame,
  RefreshCw,
  Trash2,
  Layers,
  CheckCircle2,
  Zap,
  Bookmark,
  History,
  FileText,
} from 'lucide-react';
import {
  ContentNiche,
  TopicIdea,
  ContentCalendarItem,
  DuplicateAuditResult,
  BulkContentPlan,
  VideoLanguage,
  SavedScriptItem,
  SavedHookItem,
  ContentHistoryItem,
} from '../types';
import {
  fetchContentTopics,
  fetchDailyIdeas,
  checkTopicDuplicate,
  generateBulkPlan,
  fetchSavedScripts,
  deleteSavedScript,
  fetchSavedHooks,
  deleteSavedHook,
  fetchContentHistory,
  clearContentHistory,
} from '../services/api';

interface ContentEngineStudioProps {
  onSendToScriptWriter: (topic: string, language: VideoLanguage, hook?: string) => void;
  onSendToDocumentary: (topic: string) => void;
  onSendToReels: (topic: string) => void;
  onSendToHookDesigner?: (topic: string) => void;
}

const NICHES: { id: ContentNiche; label: string; icon: string; desc: string }[] = [
  {
    id: 'business_documentaries',
    label: 'Business Documentaries',
    icon: '💼',
    desc: 'High-stakes corporate rivalries, economic revolutions & hidden monopolies',
  },
  {
    id: 'business_success_stories',
    label: 'Success Stories',
    icon: '🚀',
    desc: 'Billion-dollar turnarounds, founder grit & underdog triumphs',
  },
  {
    id: 'money_lessons',
    label: 'Money & Wealth Lessons',
    icon: '💰',
    desc: 'Financial psychology, wealth preservation & compound growth',
  },
  {
    id: 'islamic_educational',
    label: 'Islamic Educational',
    icon: '🕌',
    desc: 'Golden Age science, historical sagas & spiritual ethical wisdom',
  },
  {
    id: 'motivational',
    label: 'Motivational Narratives',
    icon: '🔥',
    desc: 'Unstoppable discipline, psychological resilience & focus',
  },
  {
    id: 'historical_documentaries',
    label: 'Historical Documentaries',
    icon: '📜',
    desc: 'Empire crossroads, warfare strategy & forgotten ancient treaties',
  },
  {
    id: 'educational_explainers',
    label: 'Educational Explainers',
    icon: '💡',
    desc: 'How the world secretly operates, demystified with clarity',
  },
  {
    id: 'viral_storytelling',
    label: 'Short-Form Viral Mysteries',
    icon: '⚡',
    desc: 'High-retention curiosity loops, bizarre facts & strange anomalies',
  },
];

const INITIAL_CALENDAR_ITEMS: ContentCalendarItem[] = [
  {
    id: 'cal-1',
    date: new Date().toISOString().split('T')[0],
    title: 'The Silent Semiconductor Monopoly: Inside ASML',
    niche: 'business_documentaries',
    platform: 'youtube_long',
    status: 'scripted',
    primaryLanguage: 'urdu',
    scriptSnippet: 'There is only one factory on Earth capable of printing microchips...',
  },
  {
    id: 'cal-2',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    title: 'Why Saving in a Bank is a Mathematical Trap',
    niche: 'money_lessons',
    platform: 'youtube_shorts',
    status: 'idea',
    primaryLanguage: 'urdu',
    notes: 'Create rapid kinetic subtitle reel with inflation graph',
  },
  {
    id: 'cal-3',
    date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    title: 'Baghdad House of Wisdom: The Golden Age of Islamic Science',
    niche: 'islamic_educational',
    platform: 'youtube_long',
    status: 'rendered',
    primaryLanguage: 'urdu',
    notes: 'Rendered in 1080p with spiritual soft color grading',
  },
];

export const ContentEngineStudio: React.FC<ContentEngineStudioProps> = ({
  onSendToScriptWriter,
  onSendToDocumentary,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'topics'
    | 'daily'
    | 'duplicate_audit'
    | 'bulk_planner'
    | 'calendar'
    | 'saved_scripts'
    | 'saved_hooks'
    | 'history'
  >('topics');

  const [selectedNiche, setSelectedNiche] = useState<ContentNiche>('business_documentaries');
  const [selectedLanguage, setSelectedLanguage] = useState<VideoLanguage>('urdu');
  const [topics, setTopics] = useState<TopicIdea[]>([]);
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [topicsSearchQuery, setTopicsSearchQuery] = useState('');

  const [dailyIdeas, setDailyIdeas] = useState<any[]>([]);
  const [isLoadingDaily, setIsLoadingDaily] = useState(false);

  const [candidateTopic, setCandidateTopic] = useState('');
  const [duplicateAudit, setDuplicateAudit] = useState<DuplicateAuditResult | null>(null);
  const [isAuditingDuplicate, setIsAuditingDuplicate] = useState(false);

  const [bulkTheme, setBulkTheme] = useState('Global Market Disruptions & Untold Power Battles');
  const [bulkPlan, setBulkPlan] = useState<BulkContentPlan | null>(null);
  const [isGeneratingBulk, setIsGeneratingBulk] = useState(false);

  // Calendar state + inline add form (no window.prompt)
  const [calendarItems, setCalendarItems] = useState<ContentCalendarItem[]>(() => {
    try {
      const saved = localStorage.getItem('nexora_content_calendar');
      return saved ? JSON.parse(saved) : INITIAL_CALENDAR_ITEMS;
    } catch {
      return INITIAL_CALENDAR_ITEMS;
    }
  });
  const [customCalendarTitle, setCustomCalendarTitle] = useState('');
  const [customCalendarDate, setCustomCalendarDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Persistent Libraries State
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryLangFilter, setLibraryLangFilter] = useState<string>('');
  const [savedScripts, setSavedScripts] = useState<SavedScriptItem[]>([]);
  const [savedHooks, setSavedHooks] = useState<SavedHookItem[]>([]);
  const [contentHistory, setContentHistory] = useState<ContentHistoryItem[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  const [notice, setNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('nexora_content_calendar', JSON.stringify(calendarItems));
    } catch (_) {}
  }, [calendarItems]);

  useEffect(() => {
    handleGenerateTopics();
    loadDailyIdeas();
  }, []);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3200);
  };

  const loadSavedScriptsList = async (search = librarySearch, lang = libraryLangFilter) => {
    setLoadingLibrary(true);
    try {
      const res = await fetchSavedScripts(search, lang);
      if (res.success) setSavedScripts(res.scripts || []);
    } catch (_) {
    } finally {
      setLoadingLibrary(false);
    }
  };

  const loadSavedHooksList = async (search = librarySearch, lang = libraryLangFilter) => {
    setLoadingLibrary(true);
    try {
      const res = await fetchSavedHooks(search, lang);
      if (res.success) setSavedHooks(res.hooks || []);
    } catch (_) {
    } finally {
      setLoadingLibrary(false);
    }
  };

  const loadContentHistoryList = async (search = librarySearch) => {
    setLoadingLibrary(true);
    try {
      const res = await fetchContentHistory(search);
      if (res.success) setContentHistory(res.history || []);
    } catch (_) {
    } finally {
      setLoadingLibrary(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'saved_scripts') loadSavedScriptsList();
    if (activeTab === 'saved_hooks') loadSavedHooksList();
    if (activeTab === 'history') loadContentHistoryList();
  }, [activeTab, librarySearch, libraryLangFilter]);

  const handleGenerateTopics = async (nicheOverride?: ContentNiche) => {
    const nicheToUse = nicheOverride || selectedNiche;
    setIsGeneratingTopics(true);
    try {
      const res = await fetchContentTopics(nicheToUse, 6, selectedLanguage);
      if (res.success && res.topics) {
        setTopics(res.topics);
      }
    } catch (err) {
      console.error('Error fetching topics:', err);
    } finally {
      setIsGeneratingTopics(false);
    }
  };

  const loadDailyIdeas = async () => {
    setIsLoadingDaily(true);
    try {
      const res = await fetchDailyIdeas();
      if (res.success && res.ideas) {
        setDailyIdeas(res.ideas);
      }
    } catch (err) {
      console.error('Error loading daily ideas:', err);
    } finally {
      setIsLoadingDaily(false);
    }
  };

  const handleCheckDuplicate = async () => {
    if (!candidateTopic.trim()) return;
    setIsAuditingDuplicate(true);
    try {
      const res = await checkTopicDuplicate(candidateTopic);
      if (res.success) {
        setDuplicateAudit(res);
      }
    } catch (err) {
      console.error('Error checking duplicate:', err);
    } finally {
      setIsAuditingDuplicate(false);
    }
  };

  const handleGenerateBulk = async () => {
    setIsGeneratingBulk(true);
    try {
      const res = await generateBulkPlan(selectedNiche, bulkTheme, selectedLanguage);
      if (res.success && res.plan) {
        setBulkPlan(res.plan);
      }
    } catch (err) {
      console.error('Error generating bulk plan:', err);
    } finally {
      setIsGeneratingBulk(false);
    }
  };

  const handleAddTopicToCalendar = (topic: string, niche: ContentNiche, dateOverride?: string) => {
    const nextDate =
      dateOverride ||
      new Date(Date.now() + calendarItems.length * 86400000).toISOString().split('T')[0];
    const newItem: ContentCalendarItem = {
      id: `cal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: nextDate,
      title: topic,
      niche,
      platform: niche === 'islamic_educational' ? 'instagram_reels' : 'youtube_long',
      status: 'idea',
      primaryLanguage: selectedLanguage,
    };
    setCalendarItems((prev) => [newItem, ...prev]);
    showNotice(`Scheduled "${topic}" for ${nextDate}.`);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTopics = topics.filter(
    (t) =>
      t.title.toLowerCase().includes(topicsSearchQuery.toLowerCase()) ||
      t.titleUrdu?.includes(topicsSearchQuery) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(topicsSearchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Studio Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-purple-950/30 border border-cyan-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>MULTI-NICHE CONTENT ENGINE &amp; LIBRARY (محرکِ مواد)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Content Strategy, Saved Vault &amp; Production Calendar
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Generate fresh video ideas across 8 niches, audit topic uniqueness, manage saved scripts and hooks,
              inspect production history, and schedule weekly video batches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleGenerateTopics()}
              disabled={isGeneratingTopics}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/50 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isGeneratingTopics ? 'animate-spin' : ''}`} />
              <span>Generate Fresh Topics</span>
            </button>
            <button
              onClick={() => setActiveTab('duplicate_audit')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Duplicate Check</span>
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-slate-800/80 mt-6 text-xs font-semibold">
          {[
            { id: 'topics', label: 'Niche Topics (8)', icon: Sparkles },
            { id: 'daily', label: 'Daily Ideas', icon: Flame },
            { id: 'duplicate_audit', label: 'Duplicate Audit', icon: ShieldCheck },
            { id: 'bulk_planner', label: '7-Day Planner', icon: Layers },
            { id: 'calendar', label: `Calendar (${calendarItems.length})`, icon: Calendar },
            { id: 'saved_scripts', label: 'Saved Scripts', icon: FileText },
            { id: 'saved_hooks', label: 'Saved Hooks', icon: Bookmark },
            { id: 'history', label: 'Content History', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-800/70 text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notice}</span>
        </div>
      )}

      {/* TAB 1: Niche Topic Radar */}
      {activeTab === 'topics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {NICHES.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  setSelectedNiche(n.id);
                  handleGenerateTopics(n.id);
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedNiche === n.id
                    ? 'bg-cyan-500/15 border-cyan-400 shadow-md shadow-cyan-950/40'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="text-xl mb-1">{n.icon}</div>
                <h4 className={`text-xs font-bold ${selectedNiche === n.id ? 'text-cyan-300' : 'text-white'}`}>
                  {n.label}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{n.desc}</p>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Filter generated ideas by keyword or tag..."
                value={topicsSearchQuery}
                onChange={(e) => setTopicsSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value as VideoLanguage);
                }}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none"
              >
                <option value="urdu">Urdu (اردو)</option>
                <option value="english">English</option>
                <option value="roman_urdu">Roman Urdu</option>
                <option value="arabic">Arabic (العربية)</option>
                <option value="hindi">Hindi (हिन्दी)</option>
                <option value="bilingual">Bilingual (Urdu + English)</option>
              </select>

              <button
                onClick={() => handleGenerateTopics()}
                disabled={isGeneratingTopics}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingTopics ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {isGeneratingTopics ? (
            <div className="p-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <h3 className="text-sm font-bold text-white">Generating Original Niche Topics...</h3>
              <p className="text-xs text-slate-400">Checking topic history to avoid duplicates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTopics.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 group shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold">
                        Relevance Est: {item.viralityScore || 85}/100
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.estimatedDuration || '8-12 mins'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                        {item.title}
                      </h3>
                      {item.titleUrdu && (
                        <p className="font-urdu text-sm text-cyan-400 mt-1 leading-relaxed text-right">
                          {item.titleUrdu}
                        </p>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/70 space-y-1">
                      <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        <span>Hook Angle:</span>
                      </p>
                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        "{item.viralHookAngle}"
                      </p>
                    </div>

                    {item.keyConflict && (
                      <p className="text-[11px] text-slate-400">
                        <span className="text-slate-300 font-semibold">Core Conflict: </span>
                        {item.keyConflict}
                      </p>
                    )}

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.tags.map((tg, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400">
                            #{tg}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyText(item.title, `title-${idx}`)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Copy Topic Title"
                      >
                        {copiedId === `title-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleAddTopicToCalendar(item.title, selectedNiche)}
                        className="p-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30"
                        title="Add to Content Calendar"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => onSendToScriptWriter(item.title, selectedLanguage)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <span>Write Script</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Daily Ideas */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Daily Editorial Topic Suggestions</h3>
                <p className="text-xs text-slate-400">
                  Fresh documentary &amp; educational concepts curated for your studio niches
                </p>
              </div>
            </div>

            <button
              onClick={loadDailyIdeas}
              disabled={isLoadingDaily}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDaily ? 'animate-spin' : ''}`} />
              <span>Refresh Ideas</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dailyIdeas.map((idea, idx) => (
              <div
                key={idea.id || idx}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold font-mono">
                    {idea.niche?.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400">{idea.estimatedDuration}</span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white leading-snug">{idea.title}</h4>
                  {idea.titleUrdu && (
                    <p className="font-urdu text-sm text-amber-300 mt-1 text-right">{idea.titleUrdu}</p>
                  )}
                </div>

                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 italic">
                  Hook Angle: "{idea.viralHookAngle}"
                </p>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">Audience: {idea.targetAudience}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddTopicToCalendar(idea.title, idea.niche)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      + Calendar
                    </button>
                    <button
                      onClick={() => onSendToScriptWriter(idea.title, selectedLanguage)}
                      className="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold"
                    >
                      Script Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Duplicate Audit */}
      {activeTab === 'duplicate_audit' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Duplicate Topic Similarity Checker</h3>
                <p className="text-xs text-slate-400">
                  Compares your proposed topic against your persistent topic and script history to avoid overlap.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-300">ENTER PROPOSED TOPIC</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="e.g. How ASML controls extreme ultraviolet lithography..."
                  value={candidateTopic}
                  onChange={(e) => setCandidateTopic(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                />
                <button
                  onClick={handleCheckDuplicate}
                  disabled={isAuditingDuplicate || !candidateTopic.trim()}
                  className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all disabled:opacity-40"
                >
                  {isAuditingDuplicate ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Check Similarity</span>
                </button>
              </div>
            </div>
          </div>

          {duplicateAudit && (
            <div
              className={`p-6 rounded-3xl border space-y-4 ${
                duplicateAudit.status === 'unique'
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                  : duplicateAudit.status === 'borderline'
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                  : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  {duplicateAudit.status === 'unique' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  )}
                  <h4 className="text-base font-bold text-white">
                    {duplicateAudit.status === 'unique'
                      ? 'Unique Topic Angle'
                      : duplicateAudit.status === 'borderline'
                      ? 'Moderate Overlap Detected'
                      : 'High Similarity / Duplicate Warning'}
                  </h4>
                </div>
                <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-white">
                  Overlap: {duplicateAudit.similarityScore}%
                </span>
              </div>

              <p className="text-xs leading-relaxed text-slate-300">{duplicateAudit.message}</p>

              {duplicateAudit.matchedTopic && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                  <span className="text-slate-400">Closest Match in History: </span>
                  <span className="font-semibold text-white">"{duplicateAudit.matchedTopic}"</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => onSendToScriptWriter(candidateTopic, selectedLanguage)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2"
                >
                  <span>Proceed to Script Writer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onSendToDocumentary(candidateTopic)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
                >
                  Open Documentary Studio
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Bulk 7-Day Strategy */}
      {activeTab === 'bulk_planner' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">7-Day Content Batch Planner</h3>
                <p className="text-xs text-slate-400">
                  Plan a balanced weekly video sequence alternating between documentaries and short reels.
                </p>
              </div>

              <button
                onClick={handleGenerateBulk}
                disabled={isGeneratingBulk}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isGeneratingBulk ? 'animate-spin' : ''}`} />
                <span>Generate 7-Day Plan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">BATCH THEME</label>
                <input
                  type="text"
                  value={bulkTheme}
                  onChange={(e) => setBulkTheme(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">NICHE</label>
                <select
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value as ContentNiche)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
                >
                  {NICHES.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {bulkPlan && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Weekly Sequence ({bulkPlan.plans?.length || 7} Days)
                </h4>
                <button
                  onClick={() => {
                    bulkPlan.plans?.forEach((p) => handleAddTopicToCalendar(p.topic, selectedNiche));
                  }}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                >
                  + Add All to Content Calendar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {bulkPlan.plans?.map((plan, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-cyan-300 font-mono">{plan.day}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{plan.format}</span>
                      </div>
                      <h5 className="text-xs font-bold text-white leading-snug">{plan.topic}</h5>
                      <p className="text-[11px] text-slate-300 italic">"{plan.hookIdea}"</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleAddTopicToCalendar(plan.topic, selectedNiche)}
                        className="text-[10px] text-purple-400 hover:text-purple-300 font-medium"
                      >
                        + Calendar
                      </button>
                      <button
                        onClick={() => onSendToScriptWriter(plan.topic, selectedLanguage)}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold"
                      >
                        Write Script →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Content Calendar */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white">Content Production Calendar</h3>
              <p className="text-xs text-slate-400">
                Schedule topics and track progress across Idea, Scripted, Recorded, Rendered &amp; Published.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customCalendarTitle}
                onChange={(e) => setCustomCalendarTitle(e.target.value)}
                placeholder="Enter custom video topic to schedule..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-cyan-400"
              />
              <input
                type="date"
                value={customCalendarDate}
                onChange={(e) => setCustomCalendarDate(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
              />
              <button
                onClick={() => {
                  if (!customCalendarTitle.trim()) return;
                  handleAddTopicToCalendar(customCalendarTitle.trim(), selectedNiche, customCalendarDate);
                  setCustomCalendarTitle('');
                }}
                disabled={!customCalendarTitle.trim()}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule Topic</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {calendarItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] font-mono text-cyan-400 block font-bold">{item.date}</span>
                    <span className="text-[9px] text-slate-400 uppercase">
                      {item.platform === 'youtube_long' ? '16:9 Long' : '9:16 Reel'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="capitalize">{item.niche.replace('_', ' ')}</span>
                      <span>•</span>
                      <span className="uppercase text-cyan-400 font-mono text-[10px]">{item.primaryLanguage}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <select
                    value={item.status}
                    onChange={(e) => {
                      const updated = [...calendarItems];
                      updated[idx].status = e.target.value as any;
                      setCalendarItems(updated);
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-bold outline-none border bg-slate-800 text-slate-200 border-slate-700"
                  >
                    <option value="idea">Idea</option>
                    <option value="scripted">Scripted</option>
                    <option value="recorded">Recorded</option>
                    <option value="rendered">Rendered</option>
                    <option value="published">Published</option>
                  </select>

                  <button
                    onClick={() => onSendToScriptWriter(item.title, item.primaryLanguage)}
                    className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                  >
                    Script
                  </button>

                  <button
                    onClick={() => setCalendarItems((prev) => prev.filter((_, i) => i !== idx))}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6 & 7 & 8: Persistent Library Search Bar */}
      {(activeTab === 'saved_scripts' || activeTab === 'saved_hooks' || activeTab === 'history') && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search library by title, topic, or text..."
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
              />
            </div>

            {activeTab !== 'history' ? (
              <select
                value={libraryLangFilter}
                onChange={(e) => setLibraryLangFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none"
              >
                <option value="">All Languages</option>
                <option value="urdu">Urdu</option>
                <option value="english">English</option>
                <option value="roman_urdu">Roman Urdu</option>
                <option value="arabic">Arabic</option>
                <option value="hindi">Hindi</option>
              </select>
            ) : (
              <button
                onClick={async () => {
                  await clearContentHistory();
                  setContentHistory([]);
                  showNotice('Content history cleared.');
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold"
              >
                Clear History
              </button>
            )}
          </div>

          {loadingLibrary ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading library...</div>
          ) : activeTab === 'saved_scripts' ? (
            savedScripts.length === 0 ? (
              <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
                No saved scripts yet. Generate a script in the AI Script Writer and click "Save to Library".
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedScripts.map((sc) => {
                  const previewHook = sc.alternativeHooks?.[0] || sc.fullScript?.slice(0, 140) || '';
                  return (
                    <div key={sc.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase">
                          {sc.primaryLanguage} • {String(sc.niche).replace(/_/g, ' ')}
                        </span>
                        <button
                          onClick={async () => {
                            await deleteSavedScript(sc.id);
                            setSavedScripts((prev) => prev.filter((item) => item.id !== sc.id));
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="text-sm font-bold text-white">{sc.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{previewHook}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <span className="text-[10px] text-slate-500">
                          {new Date(sc.createdAt).toLocaleDateString()} • {sc.wordCount} words
                        </span>
                        <button
                          onClick={() => onSendToScriptWriter(sc.topic || sc.title, sc.primaryLanguage, previewHook)}
                          className="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
                        >
                          Open in Script Writer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : activeTab === 'saved_hooks' ? (
            savedHooks.length === 0 ? (
              <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
                No saved hooks yet. Click "Save Hook" inside the Hook Designer or Script Writer.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedHooks.map((hk) => (
                  <div key={hk.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase">
                        {hk.hookType} • {hk.primaryLanguage}
                      </span>
                      <button
                        onClick={async () => {
                          await deleteSavedHook(hk.id);
                          setSavedHooks((prev) => prev.filter((item) => item.id !== hk.id));
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-white leading-relaxed">"{hk.openingLine}"</p>
                    <p className="text-[11px] text-slate-400">Topic: {hk.topic}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleCopyText(hk.openingLine, hk.id)}
                        className="text-xs text-slate-300 hover:text-white flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedId === hk.id ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={() => onSendToScriptWriter(hk.topic, hk.primaryLanguage, hk.openingLine)}
                        className="px-3 py-1 rounded-lg bg-purple-500 text-white font-bold text-xs"
                      >
                        Use in Script
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : contentHistory.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
              No generation history recorded yet. Generated scripts, hooks, documentaries, and topics are logged here automatically.
            </div>
          ) : (
            <div className="space-y-2">
              {contentHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 text-[10px] font-bold uppercase">
                        {item.actionType}
                      </span>
                      <span className="text-xs font-bold text-white">{item.title}</span>
                    </div>
                    {(item.niche || item.language) && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        {item.niche ? String(item.niche).replace(/_/g, ' ') : 'Studio'}{' '}
                        {item.language ? `• ${item.language.toUpperCase()}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                    <button
                      onClick={() => onSendToScriptWriter(item.title, item.language || 'urdu')}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold"
                    >
                      Reuse Topic
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
