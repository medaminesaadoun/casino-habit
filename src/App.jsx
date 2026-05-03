import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Diamond, Plus, Trash2, Sparkles, Paperclip, History, ArrowRightLeft, Gem, Crown, Volume2, VolumeX, CloudRain, Trophy, HelpCircle, Settings as SettingsIcon } from 'lucide-react';
import { playComplete, playClipDrop, playCashIn, playRewardWon, playClick, toggleMute, getMuteState } from './sounds';
import { api } from './api';
import Jars from './components/Jars';
import HabitList from './components/HabitList';
import ClipInventory, { SingleClip } from './components/ClipInventory';
import CashingSystem from './components/CashingSystem';
import MainWheel from './components/MainWheel';
import BonusWheel from './components/BonusWheel';
import TokenWheel from './components/TokenWheel';
import RewardBank from './components/RewardBank';
import RewardPicker from './components/RewardPicker';
import RewardCatalog from './components/RewardCatalog';
import RewardWonModal from './components/RewardWonModal';
import JackpotChoiceModal from './components/JackpotChoiceModal';
import JackpotConfetti from './components/JackpotConfetti';
import QuickTaskModal from './components/QuickTaskModal';
import GlassSelect from './components/GlassSelect';
import ActiveRewards from './components/ActiveRewards';
import BottomNav from './components/BottomNav';
import TopNav from './components/TopNav';
import UndoToast from './components/UndoToast';
import OnboardingModal from './components/OnboardingModal';
import TourTooltip from './components/TourTooltip';
import ConfirmModal from './components/ConfirmModal';
import ToastContainer from './components/ToastContainer';
import SessionSummaryModal from './components/SessionSummaryModal';
import SettingsModal from './components/SettingsModal';

const CLIP_COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'gold'];
const CLIP_WEIGHTS = [20, 20, 20, 20, 15, 4.9, 0.1];

function getRandomClip() {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (let i = 0; i < CLIP_COLORS.length; i++) {
    cumulative += CLIP_WEIGHTS[i];
    if (rand < cumulative) return CLIP_COLORS[i];
  }
  return 'red';
}

function isCashingEligible(clips, activeTier) {
  if (clips.length === 0) return false;
  const counts = clips.reduce((acc, clip) => {
    acc[clip] = (acc[clip] || 0) + 1;
    return acc;
  }, {});
  if (counts.gold > 0 && activeTier < 3) return true;
  if (activeTier === 1) {
    for (const count of Object.values(counts)) {
      if (count >= 2) return true;
    }
  }
  if (activeTier === 2) {
    for (const count of Object.values(counts)) {
      if (count >= 3) return true;
    }
  }
  return false;
}

function App() {
  const [theme, setTheme] = useState('blue');
  const [jars, setJars] = useState([]);
  const [habits, setHabits] = useState([]);
  const [inventory, setInventory] = useState({
    clips: [],
    activeTier: 1,
    cashedColors: [],
    spinTokens: 0,
    rewardBank: [],
    activeRewards: [],
    rainmakerRemaining: 0,
    lifetimeClips: {},
  });
  const [history, setHistory] = useState([]);
  const [rewardCatalog, setRewardCatalog] = useState({
    tier1: [
      { id: 'simple-t1-1', name: 'Quick pause', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 5 },
      { id: 'simple-t1-2', name: 'Short break', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 10 },
      { id: 'simple-t1-3', name: 'Extended break', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 15 },
    ],
    tier2: [
      { id: 'simple-t2-1', name: 'Free time', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 20 },
      { id: 'simple-t2-2', name: 'Half hour', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 30 },
      { id: 'simple-t2-3', name: 'Long break', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 45 },
    ],
    tier3: [
      { id: 'simple-t3-1', name: 'Free time', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 45 },
      { id: 'simple-t3-2', name: 'Free hour', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 60 },
      { id: 'simple-t3-3', name: 'Extended', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 90 },
    ],
    jackpot: [
      { id: 'simple-jp-1', name: 'Me time', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 120 },
      { id: 'simple-jp-2', name: 'Half day', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 180 },
      { id: 'simple-jp-3', name: 'Day off', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 240 },
    ],
  });
  const [showCashing, setShowCashing] = useState(false);
  const [cashingDefaultJarId, setCashingDefaultJarId] = useState(null);
  const [showBonusWheel, setShowBonusWheel] = useState(false);
  const [showCreateJar, setShowCreateJar] = useState(false);
  const [showEditJar, setShowEditJar] = useState(false);
  const [editingJar, setEditingJar] = useState(null);
  const [showCreateHabit, setShowCreateHabit] = useState(false);
  const [showEditHabit, setShowEditHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [lastClip, setLastClip] = useState(null);
  const [showTokenWheel, setShowTokenWheel] = useState(false);
  const [pendingTokenHabit, setPendingTokenHabit] = useState(null);
  const [showRewardPicker, setShowRewardPicker] = useState(false);
  const [showRewardCatalog, setShowRewardCatalog] = useState(false);
  const [rewardPickerChoices, setRewardPickerChoices] = useState([]);
  const [rewardPickerTier, setRewardPickerTier] = useState(1);
  const [showRewardWon, setShowRewardWon] = useState(false);
  const [wonReward, setWonReward] = useState(null);
  const [wonTier, setWonTier] = useState(1);
  const [wonRewardBankId, setWonRewardBankId] = useState(null);
  const [showJackpotChoice, setShowJackpotChoice] = useState(false);
  const [freeJackpotSpin, setFreeJackpotSpin] = useState(false);
  const [showQuickTask, setShowQuickTask] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [unseenRewards, setUnseenRewards] = useState(0);
  const [onboardingPhase, setOnboardingPhase] = useState('complete'); // 'modal' | 'tour' | 'complete'
  const [undoState, setUndoState] = useState(null);
  const [undoSeconds, setUndoSeconds] = useState(10);
  const [clipToast, setClipToast] = useState(null);
  const [mobileView, setMobileView] = useState('wheel');
  const [loading, setLoading] = useState(true);
  const [useApi, setUseApi] = useState(true);
  const [isMuted, setIsMuted] = useState(() => getMuteState());
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, danger: false });
  const [toasts, setToasts] = useState([]);
  const [sessionSummary, setSessionSummary] = useState({ isOpen: false, habit: null, clip: null, tokenWon: false });
  const [showSettings, setShowSettings] = useState(false);
  const inventoryRef = useRef(inventory);

  // Keep inventoryRef in sync for stale-closure-safe access
  useEffect(() => {
    inventoryRef.current = inventory;
  }, [inventory]);

  // Undo countdown timer
  useEffect(() => {
    if (!undoState) { setUndoSeconds(0); return; }
    setUndoSeconds(10);
    const interval = setInterval(() => {
      setUndoSeconds((prev) => {
        if (prev <= 1) { setUndoState(null); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [undoState]);

  // Clear unseen rewards badge when viewing the Rewards tab
  useEffect(() => {
    if (mobileView === 'rewards') setUnseenRewards(0);
  }, [mobileView]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ch_theme', theme);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem('ch_theme');
    if (saved) setTheme(saved);
    // Unified onboarding: modal -> tour -> complete
    const onboarded = localStorage.getItem('ch_onboarded');
    if (!onboarded || onboarded === 'modal') {
      setOnboardingPhase('modal');
    } else if (onboarded === 'tour') {
      setOnboardingPhase('tour');
    } else {
      setOnboardingPhase('complete');
    }
  }, []);

  const openConfirm = (config) => setConfirmModal({ ...config, isOpen: true });
  const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));
  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const handleResetAll = () => {
    localStorage.clear();
    const defaults = {
      tier1: [
        { id: 'simple-t1-1', name: 'Quick pause', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 5 },
        { id: 'simple-t1-2', name: 'Short break', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 10 },
        { id: 'simple-t1-3', name: 'Extended break', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 15 },
      ],
      tier2: [
        { id: 'simple-t2-1', name: 'Free time', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 20 },
        { id: 'simple-t2-2', name: 'Half hour', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 30 },
        { id: 'simple-t2-3', name: 'Long break', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 45 },
      ],
      tier3: [
        { id: 'simple-t3-1', name: 'Free time', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 45 },
        { id: 'simple-t3-2', name: 'Free hour', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 60 },
        { id: 'simple-t3-3', name: 'Extended', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 90 },
      ],
      jackpot: [
        { id: 'simple-jp-1', name: 'Me time', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 120 },
        { id: 'simple-jp-2', name: 'Half day', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 180 },
        { id: 'simple-jp-3', name: 'Day off', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 240 },
      ],
    };
    setInventory({ clips: [], activeTier: 1, cashedColors: [], spinTokens: 0, rewardBank: [], activeRewards: [], rainmakerRemaining: 0, lifetimeClips: {} });
    setJars([]);
    setHabits([]);
    setHistory([]);
    setRewardCatalog(defaults);
    addToast('All data reset', 'warning');
    closeConfirm();
    localStorage.removeItem('ch_onboarded');
    setOnboardingPhase('modal');
  };

  useEffect(() => {
    if (showConfetti) {
      const t = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showConfetti]);

  useEffect(() => {
    async function loadData() {
      try {
        const [jarsData, habitsData, invData, histData, catalogData] = await Promise.all([
          api.getJars(),
          api.getHabits(),
          api.getInventory(),
          api.getHistory(),
          api.getRewardCatalog(),
        ]);
        setJars(jarsData.map((j) => ({ ...j, cashedClips: j.cashedClips || [] })));
        setHabits(habitsData);
        setInventory(invData);
        setHistory(histData);
        setRewardCatalog(catalogData);
        setUseApi(true);
      } catch (err) {
        console.warn('API unavailable, using localStorage fallback', err);
        setUseApi(false);
        const savedJars = localStorage.getItem('ch_jars');
        const savedHabits = localStorage.getItem('ch_habits');
        const savedInv = localStorage.getItem('ch_inventory');
        const savedHist = localStorage.getItem('ch_history');
        const savedCatalog = localStorage.getItem('ch_catalog');
        if (savedJars) setJars(JSON.parse(savedJars).map((j) => ({ ...j, cashedClips: j.cashedClips || [] })));
        if (savedHabits) setHabits(JSON.parse(savedHabits));
        if (savedInv) setInventory(JSON.parse(savedInv));
        else setInventory({ clips: [], activeTier: 1, cashedColors: [], spinTokens: 0, rewardBank: [], activeRewards: [], rainmakerRemaining: 0 });
        if (savedHist) setHistory(JSON.parse(savedHist));
        else setHistory([]);
        if (savedCatalog) setRewardCatalog(JSON.parse(savedCatalog));
        else setRewardCatalog({
    tier1: [
      { id: 'simple-t1-1', name: 'Quick pause', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 5 },
      { id: 'simple-t1-2', name: 'Short break', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 10 },
      { id: 'simple-t1-3', name: 'Extended break', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 15 },
    ],
    tier2: [
      { id: 'simple-t2-1', name: 'Free time', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 20 },
      { id: 'simple-t2-2', name: 'Half hour', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 30 },
      { id: 'simple-t2-3', name: 'Long break', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 45 },
    ],
    tier3: [
      { id: 'simple-t3-1', name: 'Free time', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 45 },
      { id: 'simple-t3-2', name: 'Free hour', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 60 },
      { id: 'simple-t3-3', name: 'Extended', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 90 },
    ],
    jackpot: [
      { id: 'simple-jp-1', name: 'Me time', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 120 },
      { id: 'simple-jp-2', name: 'Half day', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 180 },
      { id: 'simple-jp-3', name: 'Day off', icon: '⏱️', enabled: true, custom: true, gracePeriodMinutes: 0, durationMinutes: 240 },
    ],
  });
      }
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!useApi && !loading) {
      localStorage.setItem('ch_jars', JSON.stringify(jars));
      localStorage.setItem('ch_habits', JSON.stringify(habits));
      localStorage.setItem('ch_inventory', JSON.stringify(inventory));
      localStorage.setItem('ch_history', JSON.stringify(history));
      localStorage.setItem('ch_catalog', JSON.stringify(rewardCatalog));
    }
  }, [jars, habits, inventory, history, rewardCatalog, useApi, loading]);

  const handleCompleteHabit = async (habit) => {
    setUndoState(null);
    playComplete();
    const now = new Date().toISOString();
    const updatedHabit = { ...habit, completedDates: [...habit.completedDates, now] };
    const updatedHabits = habits.map((h) => (h.id === habit.id ? updatedHabit : h));
    setHabits(updatedHabits);

    const clip = getRandomClip();
    const newInventory = {
      ...inventory,
      clips: [...inventory.clips, clip],
      lifetimeClips: { ...(inventory.lifetimeClips || {}), [clip]: ((inventory.lifetimeClips || {})[clip] || 0) + 1 },
    };
    setInventory(newInventory);
    setLastClip(clip);
    setClipToast({ color: clip, visible: true, id: Date.now() });
    setTimeout(() => setClipToast(null), 2500);
    setTimeout(() => playClipDrop(), 300);

    const habitEntry = {
      id: `hist-${Date.now()}`,
      type: 'habit',
      habitName: habit.name,
      habitId: habit.id,
      timestamp: now,
    };
    setHistory((prev) => [...prev, habitEntry]);

    // Save undo state
    setUndoState({
      habit,
      clip,
      historyId: habitEntry.id,
      completedDate: now,
    });

    if (useApi) {
      try {
        await api.updateHabit(habit.id, updatedHabit);
        await api.updateInventory(newInventory);
        await api.addHistory(habitEntry);
      } catch {
        setUseApi(false);
      }
    }

    setPendingTokenHabit(habit);
    setShowTokenWheel(true);
  };

  const handleUndo = () => {
    if (!undoState) return;
    const { habit, clip, historyId, completedDate } = undoState;
    setShowTokenWheel(false);
    setPendingTokenHabit(null);
    setUndoState(null);

    setHabits((prev) =>
      prev.map((h) =>
        h.id === habit.id
          ? { ...h, completedDates: h.completedDates.filter((d) => d !== completedDate) }
          : h
      )
    );

    setInventory((prev) => {
      const clipsCopy = [...prev.clips];
      const lastIdx = clipsCopy.lastIndexOf(clip);
      if (lastIdx !== -1) clipsCopy.splice(lastIdx, 1);
      return { ...prev, clips: clipsCopy };
    });

    setHistory((prev) => prev.filter((h) => h.id !== historyId));
  };

  const handleTokenWheelComplete = (won) => {
    setShowTokenWheel(false);
    if (won) {
      setInventory((prev) => {
        const rainmakerActive = (prev.rainmakerRemaining || 0) > 0;
        const tokenGain = rainmakerActive ? 2 : 1;
        const updated = {
          ...prev,
          spinTokens: (prev.spinTokens || 0) + tokenGain,
        };
        if (useApi) api.updateInventory(updated).catch(() => setUseApi(false));
        return updated;
      });
    }
    // Rainmaker decrements on EVERY habit completion, win or lose
    setInventory((prev) => {
      if ((prev.rainmakerRemaining || 0) > 0) {
        const updated = {
          ...prev,
          rainmakerRemaining: Math.max(0, (prev.rainmakerRemaining || 0) - 1),
        };
        if (useApi) api.updateInventory(updated).catch(() => setUseApi(false));
        return updated;
      }
      return prev;
    });
    // Show session summary
    setSessionSummary({
      isOpen: true,
      habit: pendingTokenHabit,
      clip: lastClip,
      tokenWon: won,
    });

    if (pendingTokenHabit) {
      if (isCashingEligible(inventoryRef.current.clips, inventoryRef.current.activeTier)) {
        setCashingDefaultJarId(pendingTokenHabit.jarId);
        setShowCashing(true);
      }
      setPendingTokenHabit(null);
    }
  };

  const handleConsumeToken = () => {
    setInventory((prev) => {
      const updated = { ...prev, spinTokens: Math.max(0, (prev.spinTokens || 0) - 1) };
      if (useApi) api.updateInventory(updated).catch(() => setUseApi(false));
      return updated;
    });
  };

  const handleConsumeMegaToken = () => {
    setInventory((prev) => {
      const updated = { ...prev, spinTokens: Math.max(0, (prev.spinTokens || 0) - 5) };
      if (useApi) api.updateInventory(updated).catch(() => setUseApi(false));
      return updated;
    });
  };

  const handleCashIn = async ({ jarId, color, clipsToRemove, newTier }) => {
    playCashIn();
    const clipsToRemoveCopy = [...clipsToRemove];
    const updatedClips = inventory.clips.filter((c) => {
      const matchIdx = clipsToRemoveCopy.findIndex((rc) => rc === c);
      if (matchIdx !== -1) {
        clipsToRemoveCopy.splice(matchIdx, 1);
        return false;
      }
      return true;
    });

    const newInventory = {
      clips: updatedClips,
      activeTier: newTier,
      cashedColors: [...inventory.cashedColors, color],
      spinTokens: inventory.spinTokens,
      rewardBank: inventory.rewardBank,
      activeRewards: inventory.activeRewards,
    };
    setInventory(newInventory);

    const updatedJars = jars.map((jar) => {
      if (jar.id === jarId) return { ...jar, totalClips: jar.totalClips + clipsToRemove.length, cashedClips: [...(jar.cashedClips || []), ...clipsToRemove] };
      return jar;
    });
    setJars(updatedJars);

    if (useApi) {
      try {
        await api.updateInventory(newInventory);
        await Promise.all(updatedJars.map((j) => api.updateJar(j.id, j)));
      } catch {
        setUseApi(false);
      }
    }

    setShowCashing(false);
    setCashingDefaultJarId(null);
    addToast('Clips cashed in! Tier upgraded', 'success');
  };

  const handleRewardFromTier = (tierLabel) => {
    const tierMap = {
      'Tier 1': { key: 'tier1', num: 1 },
      'Tier 2': { key: 'tier2', num: 2 },
      'Tier 3': { key: 'tier3', num: 3 },
      'Jackpot': { key: 'jackpot', num: 4 },
    };
    const mapped = tierMap[tierLabel];
    if (!mapped) return;

    const pool = (rewardCatalog[mapped.key] || []).filter((r) => r.enabled);
    if (pool.length === 0) return;

    if (pool.length <= 3) {
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      addRewardToBank(chosen, mapped.num);
    } else if (pool.length <= 5) {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      setRewardPickerChoices(shuffled.slice(0, 2));
      setRewardPickerTier(mapped.num);
      setShowRewardPicker(true);
    } else {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      setRewardPickerChoices(shuffled.slice(0, 3));
      setRewardPickerTier(mapped.num);
      setShowRewardPicker(true);
    }
  };

  const addRewardToBank = (reward, tier) => {
    playRewardWon(tier);
    setUnseenRewards((prev) => prev + 1);
    const bankEntry = {
      id: `bank-${Date.now()}`,
      tier,
      name: reward.name,
      icon: reward.icon,
      durationMinutes: reward.durationMinutes ?? 60,
      gracePeriodMinutes: reward.gracePeriodMinutes ?? 0,
      wonAt: new Date().toISOString(),
    };
    setInventory((prev) => {
      const bank = prev.rewardBank || [];
      const updated = { ...prev, rewardBank: [...bank, bankEntry] };
      if (useApi) api.updateInventory(updated).catch(() => setUseApi(false));
      return updated;
    });
    setWonReward(bankEntry);
    setWonTier(tier);
    setWonRewardBankId(bankEntry.id);
    setShowRewardWon(true);
  };

  const handleClaimReward = (bankEntry) => {
    const grace = bankEntry.gracePeriodMinutes ?? 0;
    const activeEntry = {
      id: `active-${Date.now()}`,
      rewardName: bankEntry.name,
      icon: bankEntry.icon,
      tier: bankEntry.tier,
      claimedAt: new Date().toISOString(),
      startedAt: grace === 0 ? new Date().toISOString() : null,
      status: grace === 0 ? 'active' : 'grace',
      gracePeriodMinutes: grace,
      durationMinutes: bankEntry.durationMinutes ?? 60,
    };

    setInventory((prev) => {
      const updated = {
        ...prev,
        rewardBank: (prev.rewardBank || []).filter((r) => r.id !== bankEntry.id),
        activeRewards: [...(prev.activeRewards || []), activeEntry],
      };
      if (useApi) api.updateInventory(updated).catch(() => setUseApi(false));
      return updated;
    });
    addToast('Reward activated', 'success');
  };

  const handleUseRewardNow = () => {
    if (!wonRewardBankId) return;
    setInventory((prev) => {
      const bankEntry = (prev.rewardBank || []).find((r) => r.id === wonRewardBankId);
      if (!bankEntry) return prev;
      const grace = bankEntry.gracePeriodMinutes ?? 0;
      const activeEntry = {
        id: `active-${Date.now()}`,
        rewardName: bankEntry.name,
        icon: bankEntry.icon,
        tier: bankEntry.tier,
        claimedAt: new Date().toISOString(),
        startedAt: grace === 0 ? new Date().toISOString() : null,
        status: grace === 0 ? 'active' : 'grace',
        gracePeriodMinutes: grace,
        durationMinutes: bankEntry.durationMinutes ?? 60,
      };
      const updated = {
        ...prev,
        rewardBank: (prev.rewardBank || []).filter((r) => r.id !== wonRewardBankId),
        activeRewards: [...(prev.activeRewards || []), activeEntry],
      };
      if (useApi) api.updateInventory(updated).catch(() => setUseApi(false));
      return updated;
    });
    setShowRewardWon(false);
    setWonRewardBankId(null);
  };

  const handleClaimRewardLater = () => {
    setShowRewardWon(false);
    setWonRewardBankId(null);
  };

  const findCatalogReward = (name) => {
    for (const tier of ['tier1', 'tier2', 'tier3', 'jackpot']) {
      const found = rewardCatalog[tier]?.find((r) => r.name === name);
      if (found) return found;
    }
    return null;
  };

  const handleSkipGrace = (activeReward) => {
    setInventory((prev) => ({
      ...prev,
      activeRewards: (prev.activeRewards || []).map((r) =>
        r.id === activeReward.id
          ? { ...r, status: 'active', startedAt: new Date().toISOString() }
          : r
      ),
    }));
  };

  const handleCancelGrace = (activeReward) => {
    setInventory((prev) => ({
      ...prev,
      activeRewards: (prev.activeRewards || []).filter((r) => r.id !== activeReward.id),
    }));
  };

  const handleCompleteEarly = (activeReward) => {
    setInventory((prev) => ({
      ...prev,
      activeRewards: (prev.activeRewards || []).filter((r) => r.id !== activeReward.id),
    }));
    const claimEntry = {
      id: `hist-${Date.now()}`,
      type: 'reward-completed',
      rewardName: activeReward.rewardName,
      tier: activeReward.tier,
      timestamp: new Date().toISOString(),
    };
    setHistory((prev) => [...prev, claimEntry]);
    if (useApi) api.addHistory(claimEntry).catch(() => setUseApi(false));
    addToast('Reward completed', 'success');
  };

  const handleDismissExpired = (activeReward) => {
    setInventory((prev) => ({
      ...prev,
      activeRewards: (prev.activeRewards || []).filter((r) => r.id !== activeReward.id),
    }));
  };

  const handleDeleteAllRewards = () => {
    setInventory((prev) => {
      const updated = { ...prev, rewardBank: [] };
      if (useApi) api.updateInventory(updated).catch(() => setUseApi(false));
      return updated;
    });
  };

  const handleSaveCatalog = async (newCatalog) => {
    setRewardCatalog(newCatalog);
    setShowRewardCatalog(false);
    if (useApi) api.updateRewardCatalog(newCatalog).catch(() => setUseApi(false));
    addToast('Reward catalog updated', 'success');
  };

  const handleSpinComplete = (spinResult, options = {}) => {
    const { isMegaSpin = false, isFreeJackpot = false } = options;

    // Free jackpot spin: fixed reward (Tier 3 + Bonus Wheel)
    if (isFreeJackpot) {
      setHistory((prev) => {
        const newEntry = {
          id: `hist-${Date.now()}`,
          type: 'main-wheel',
          result: 'Jackpot (Free)',
          raw: 'Jackpot',
          timestamp: new Date().toISOString(),
        };
        if (useApi) api.addHistory(newEntry).catch(() => setUseApi(false));
        return [...prev, newEntry];
      });

      setInventory((prev) => {
        const updated = { ...prev, activeTier: 1 };
        if (useApi) api.updateInventory(updated).catch(() => setUseApi(false));
        return updated;
      });

      setFreeJackpotSpin(false);
      // Free Jackpot spin gives Double-Up: 2x Tier 3 rewards
      setTimeout(() => {
        handleRewardFromTier('Tier 3');
      }, 1500);
      setTimeout(() => {
        handleRewardFromTier('Tier 3');
      }, 4000);
      return;
    }

    setHistory((prev) => {
      const newEntry = {
        id: `hist-${Date.now()}`,
        type: 'main-wheel',
        result: spinResult.effective,
        raw: spinResult.landed,
        isMegaSpin,
        timestamp: new Date().toISOString(),
      };
      if (useApi) api.addHistory(newEntry).catch(() => setUseApi(false));
      return [...prev, newEntry];
    });

    setInventory((prev) => {
      const updated = { ...prev, activeTier: 1 };
      if (useApi) api.updateInventory(updated).catch(() => setUseApi(false));
      return updated;
    });

    if (spinResult.isBonus) {
      setShowBonusWheel(true);
    } else if (spinResult.effective === 'Jackpot' && isMegaSpin) {
      // Mega spin jackpot: show choice modal
      setTimeout(() => {
        setShowJackpotChoice(true);
      }, 1500);
    } else if (spinResult.effective.startsWith('Tier') || spinResult.effective === 'Jackpot') {
      setTimeout(() => {
          handleRewardFromTier(spinResult.effective);
      }, 2000);
    }
  };

  const handleJackpotChoice = (choice) => {
    setShowJackpotChoice(false);
    switch (choice) {
      case 'double-up':
        handleRewardFromTier('Tier 3');
        setTimeout(() => {
          handleRewardFromTier('Tier 3');
        }, 3500);
        break;
      case 'chain-reaction':
        handleRewardFromTier('Tier 3');
        setTimeout(() => {
          setShowBonusWheel(true);
        }, 3000);
        break;
      case 'the-lock':
        handleRewardFromTier('Tier 3');
        setFreeJackpotSpin(true);
        break;
      case 'rainmaker':
        handleRewardFromTier('Tier 3');
        setInventory((prev) => {
          const updated = { ...prev, rainmakerRemaining: (prev.rainmakerRemaining || 0) + 6 };
          if (useApi) api.updateInventory(updated).catch(() => setUseApi(false));
          return updated;
        });
        break;
      default:
        break;
    }
  };

  const handleBonusComplete = (bonusResult) => {
    if (bonusResult.claimed) {
      const clip = getRandomClip();
      setInventory((prev) => {
        const updated = { ...prev, clips: [...prev.clips, clip] };
        if (useApi) api.updateInventory(updated).catch(() => setUseApi(false));
        return updated;
      });
    }
    setShowBonusWheel(false);
    if (bonusResult.timedOut) {
      alert('Time ran out! Streak ended.');
    }
    // dismissed: true — silently close, no alert
  };

  const handleCreateJar = async () => {
    if (!newJarName.trim()) return;
    const newJar = {
      id: `jar-${Date.now()}`,
      name: newJarName,
      color: newJarColor,
      totalClips: 0,
      cashedClips: [],
      milestones: [
        { target: 1000, reward: 'Small Reward' },
        { target: 5000, reward: 'Medium Reward' },
        { target: 10000, reward: 'Big Reward' },
      ],
    };
    setJars((prev) => [...prev, newJar]);
    setNewJarName('');
    setShowCreateJar(false);
    // Reopen habit form if it was closed to create this jar
    setShowCreateHabit(true);
    if (useApi) api.createJar(newJar).catch(() => setUseApi(false));
    addToast('Jar created', 'success');
  };

  const handleEditJar = (jar) => {
    setEditingJar({ ...jar });
    setShowEditJar(true);
  };

  const handleSaveEditJar = async () => {
    if (!editingJar || !editingJar.name.trim()) return;
    setJars((prev) => prev.map((j) => (j.id === editingJar.id ? editingJar : j)));
    setShowEditJar(false);
    setEditingJar(null);
    if (useApi) api.updateJar(editingJar.id, editingJar).catch(() => setUseApi(false));
    addToast('Jar updated', 'success');
  };

  const handleDeleteJar = (id) => {
    openConfirm({
      title: 'Delete Jar?',
      message: 'This jar and its associated data will be removed. This cannot be undone.',
      danger: true,
      onConfirm: () => {
        setJars((prev) => prev.filter((j) => j.id !== id));
        if (useApi) api.deleteJar(id).catch(() => setUseApi(false));
        addToast('Jar deleted', 'success');
        closeConfirm();
      },
    });
  };

  const updateEditingMilestone = (idx, field, value) => {
    if (!editingJar) return;
    const newMilestones = [...editingJar.milestones];
    newMilestones[idx] = { ...newMilestones[idx], [field]: field === 'target' ? parseInt(value) || 0 : value };
    setEditingJar({ ...editingJar, milestones: newMilestones });
  };

  const handleCreateHabit = async () => {
    if (!newHabitName.trim()) return;
    const jarId = newHabitJarId || jars[0]?.id || '';
    const newHabit = {
      id: `habit-${Date.now()}`,
      name: newHabitName,
      description: newHabitDesc,
      jarId,
      color: newHabitColor,
      completedDates: [],
      tags: newHabitTags,
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [...prev, newHabit]);
    setNewHabitName('');
    setNewHabitDesc('');
    setNewHabitJarId(jars[0]?.id || '');
    setNewHabitTags([]);
    setShowCreateHabit(false);
    if (useApi) api.createHabit(newHabit).catch(() => setUseApi(false));
    addToast('Habit saved', 'success');
  };

  const handleEditHabit = (habit) => {
    setEditingHabit({ ...habit });
    setShowEditHabit(true);
  };

  const handleSaveEditHabit = async () => {
    if (!editingHabit || !editingHabit.name.trim()) return;
    setHabits((prev) => prev.map((h) => (h.id === editingHabit.id ? editingHabit : h)));
    setShowEditHabit(false);
    setEditingHabit(null);
    if (useApi) api.updateHabit(editingHabit.id, editingHabit).catch(() => setUseApi(false));
    addToast('Habit updated', 'success');
  };

  const handleDeleteHabit = (id) => {
    openConfirm({
      title: 'Delete Habit?',
      message: 'This habit and its history will be removed. This cannot be undone.',
      danger: true,
      onConfirm: () => {
        setHabits((prev) => prev.filter((h) => h.id !== id));
        if (useApi) api.deleteHabit(id).catch(() => setUseApi(false));
        addToast('Habit deleted', 'success');
        closeConfirm();
      },
    });
  };

  const handleDeleteAllClips = async () => {
    setInventory((prev) => {
      const updated = { ...prev, clips: [] };
      if (useApi) api.updateInventory(updated).catch(() => setUseApi(false));
      return updated;
    });
  };

  const handleClearHistory = () => {
    openConfirm({
      title: 'Clear History?',
      message: 'All activity history will be permanently deleted. This cannot be undone.',
      danger: true,
      onConfirm: () => {
        setHistory([]);
        addToast('History cleared', 'success');
        closeConfirm();
      },
    });
  };

  const handleQuickTaskComplete = (name, jarId) => {
    playComplete();
    const now = new Date().toISOString();
    const clip = getRandomClip();
    setInventory((prev) => {
      const updated = { ...prev, clips: [...prev.clips, clip] };
      if (useApi) api.updateInventory(updated).catch(() => setUseApi(false));
      return updated;
    });
    setLastClip(clip);
    setClipToast({ color: clip, visible: true, id: Date.now() });
    setTimeout(() => setClipToast(null), 2500);
    setTimeout(() => playClipDrop(), 300);

    const entry = {
      id: `hist-${Date.now()}`,
      type: 'quick-task',
      habitName: name,
      jarId: jarId || null,
      timestamp: now,
    };
    setHistory((prev) => [...prev, entry]);
    if (useApi) api.addHistory(entry).catch(() => setUseApi(false));

    setShowQuickTask(false);
    setPendingTokenHabit(null);
    setShowTokenWheel(true);
  };

  const [newJarName, setNewJarName] = useState('');
  const [newJarColor, setNewJarColor] = useState('#ef4444');
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');
  const [newHabitJarId, setNewHabitJarId] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#ef4444');
  const [newHabitTags, setNewHabitTags] = useState([]);
  const [editingHabitTags, setEditingHabitTags] = useState([]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-casino-bg)' }}>
        <div className="text-casino-text-secondary text-lg font-medium animate-pulse">Loading...</div>
      </div>
    );
  }

  const unclaimedRewards = inventory.rewardBank || [];
  const activeRewardList = inventory.activeRewards || [];
  const allTags = [...new Set(habits.flatMap((h) => h.tags || []))];

  return (
    <div className="min-h-screen pb-24 md:pb-0 relative overflow-hidden" style={{ backgroundColor: 'var(--color-casino-bg)' }}>

      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-6 md:pt-8 relative z-10">

        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center glass glow-subtle">
              <Diamond size={22} className="text-casino-accent" />
            </div>
            <div>
              <h1 className="font-display italic text-2xl md:text-3xl gold-text leading-none tracking-tight">
                CasinoHabit
              </h1>
              <p className="text-[11px] text-casino-text-tertiary mt-1 font-medium">
                Track · Spin · Win
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="glass rounded-xl p-1 flex items-center gap-1" data-tour="header-stats">
              <div className="px-3 py-1.5 flex items-center gap-1.5 text-sm font-bold tabular-nums" title="Spin tokens">
                <Sparkles size={14} className="text-casino-accent" />
                <motion.span
                  key={inventory.spinTokens}
                  className="liquid-gold"
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {inventory.spinTokens || 0}
                </motion.span>

              </div>
              <div className="w-px h-5 bg-white/10" />
              {(inventory.rainmakerRemaining || 0) > 0 && (
                <>
                  <div className="rainmaker-badge px-2.5 py-1 flex items-center gap-1 text-[11px] font-bold text-casino-accent tabular-nums">
                    <CloudRain size={12} />
                    <span>{inventory.rainmakerRemaining}</span>
                  </div>
                  <div className="w-px h-5 bg-white/10" />
                </>
              )}
              <div className="px-3 py-1.5 flex items-center gap-1.5 text-sm font-semibold text-white tabular-nums" title="Total clips">
                <Paperclip size={14} className="text-casino-text-secondary" />
                <span>{inventory.clips.length}</span>
              </div>
              <div className="w-px h-5 bg-white/10" />
              <div className="px-3 py-1.5 flex items-center gap-1.5 text-sm font-semibold tabular-nums" style={{ color: 'var(--color-casino-accent)' }} title="Current tier">
                <Crown size={14} />
                <span>T{inventory.activeTier}</span>
              </div>
            </div>
            <button
              onClick={() => { playClick(); setShowSettings(true); }}
              className="w-9 h-9 rounded-xl glass flex items-center justify-center text-casino-text-tertiary hover:text-white transition-colors"
              title="Settings"
              aria-label="Settings"
            >
              <SettingsIcon size={16} />
            </button>
            <button
              onClick={() => { playClick(); setOnboardingPhase('modal'); }}
              className="w-9 h-9 rounded-xl flex items-center justify-center glass btn-ghost"
              title="How to play"
              aria-label="How to play"
            >
              <HelpCircle size={16} />
            </button>
          </div>
        </header>

        {/* Active Rewards */}
        <ActiveRewards
          rewards={activeRewardList}
          onSkipGrace={handleSkipGrace}
          onCompleteEarly={handleCompleteEarly}
          onDismissExpired={handleDismissExpired}
          onCancelGrace={handleCancelGrace}
          onRequestConfirm={openConfirm}
        />

        {/* Desktop Top Nav */}
        <div className="hidden lg:block">
          <TopNav active={mobileView} onChange={setMobileView} unseenRewards={unseenRewards} />
        </div>

        {/* Mobile: Always show wheel + bento sections */}
        <div className="lg:hidden">
          {/* Wheel — always visible on mobile */}
          <div className="mb-6">
            {!showBonusWheel ? (
              <div className="glass-float gold-foil p-6 flex flex-col items-center">
                <p className="font-heading text-sm text-white mb-6 tracking-tight">Spin the Wheel</p>
                  <MainWheel
                    activeTier={inventory.activeTier}
                    spinTokens={inventory.spinTokens || 0}
                    canMegaSpin={(inventory.spinTokens || 0) >= 5}
                    isFreeJackpotSpin={freeJackpotSpin}
                    onConsumeToken={handleConsumeToken}
                    onConsumeMegaToken={handleConsumeMegaToken}
                    onSpinComplete={handleSpinComplete}
                    onShowConfetti={() => setShowConfetti(true)}
                  />
                </div>
              ) : (
                <div className="glass-float gold-foil p-6 flex flex-col items-center">
                  <p className="text-sm font-semibold text-casino-success mb-6">Bonus Spin</p>
                  <BonusWheel
                    onBonusComplete={handleBonusComplete}
                    onShowConfetti={() => setShowConfetti(true)}
                    onExtraSpin={() => {
                    setInventory((prev) => {
                      const updated = { ...prev, spinTokens: (prev.spinTokens || 0) + 1 };
                      if (useApi) api.updateInventory(updated).catch(() => setUseApi(false));
                      return updated;
                    });
                    setShowBonusWheel(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* Mobile tabbed sections */}
          <div className={`mb-6 ${mobileView !== 'habits' ? 'hidden' : ''}`}>
            {/* Daily Stats */}
            {(() => {
              const today = new Date().toISOString().slice(0, 10);
              const completedToday = habits.filter((h) => h.completedDates.some((d) => d.startsWith(today))).length;
              const earnedToday = history.filter((h) => h.type === 'habit' && h.timestamp.startsWith(today)).length;
              const tokens = inventory.spinTokens || 0;
              return (
                <div className="glass p-3 mb-4 flex items-center justify-around text-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-lg font-bold text-casino-accent tabular-nums">&#10003;{completedToday}</span>
                    <span className="text-[10px] text-casino-text-tertiary">Completed</span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-lg font-bold text-casino-accent tabular-nums">&#9830;{earnedToday}</span>
                    <span className="text-[10px] text-casino-text-tertiary">Clips</span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-lg font-bold text-casino-accent tabular-nums">{tokens}</span>
                    <span className="text-[10px] text-casino-text-tertiary">Tokens</span>
                  </div>
                </div>
              );
            })()}
            <HabitList
              habits={habits}
              jars={jars}
              tags={allTags}
              onComplete={handleCompleteHabit}
              onEdit={handleEditHabit}
              onDelete={handleDeleteHabit}
              onAdd={() => setShowCreateHabit(true)}
              onQuickTask={() => setShowQuickTask(true)}
            />
            <div className="mt-4" data-tour="cash-in-area">
              <ClipInventory clips={inventory.clips} activeTier={inventory.activeTier} lifetimeClips={inventory.lifetimeClips} onDeleteAll={handleDeleteAllClips} onRequestConfirm={openConfirm} />
              {isCashingEligible(inventory.clips, inventory.activeTier) ? (
                <button
                  onClick={() => { setCashingDefaultJarId(null); setShowCashing(true); }}
                  className="btn-pill btn-gold w-full mt-3"
                >
                  <ArrowRightLeft size={16} />
                  Cash In Clips
                </button>
              ) : (
                <div className="glass py-3 px-4 text-center text-casino-text-tertiary text-xs mt-3">
                  Collect 2+ matching clips to cash in
                </div>
              )}
            </div>
          </div>

          <div className={`mb-6 ${mobileView !== 'jars' ? 'hidden' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-heading text-sm text-white tracking-tight">Jars</p>
              <button
                onClick={() => setShowCreateJar(true)}
                className="btn-ghost text-xs flex items-center gap-1.5 font-semibold" style={{ color: 'var(--color-casino-accent)' }}
              >
                <Plus size={14} /> New
              </button>
            </div>
            <Jars jars={jars} habits={habits} history={history} onAddJar={() => setShowCreateJar(true)} onEditJar={handleEditJar} onDeleteJar={handleDeleteJar} />
          </div>

          <div className={`mb-6 ${mobileView !== 'rewards' ? 'hidden' : ''}`} data-tour="reward-bank">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white">Unclaimed Rewards</p>
              <button
                onClick={() => setShowRewardCatalog(true)}
                className="btn-pill btn-ghost text-xs font-semibold"
              >
                Edit Catalog
              </button>
            </div>
            <RewardBank
              rewards={unclaimedRewards}
              onClaim={handleClaimReward}
              onDeleteAll={handleDeleteAllRewards}
              onRequestConfirm={openConfirm}
            />
          </div>

          <div className={`${mobileView !== 'history' ? 'hidden' : ''}`}>
            <div className="glass p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-heading text-sm text-white tracking-tight">History</p>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="btn-pill btn-ghost text-xs flex items-center gap-1 text-casino-danger"
                  >
                    <Trash2 size={12} /> Clear
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <p className="text-casino-text-tertiary text-center py-8 text-sm">No activity yet. Complete a habit!</p>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-hide">
                  {[...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50).map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-casino-card text-sm">
                      <span className="text-casino-text-tertiary text-xs tabular-nums shrink-0">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {item.type === 'habit' ? (
                        <span className="flex-1 mx-3 text-casino-text text-xs">
                          Completed <span className="font-semibold text-casino-text">{item.habitName}</span>
                        </span>
                      ) : item.type === 'reward-claimed' ? (
                        <span className="flex-1 mx-3 text-casino-text text-xs">
                          Claimed <span className="font-semibold text-casino-success">{item.rewardName}</span>
                        </span>
                      ) : item.type === 'reward-completed' ? (
                        <span className="flex-1 mx-3 text-casino-text text-xs">
                          Finished <span className="font-semibold text-casino-accent">{item.rewardName}</span>
                        </span>
                      ) : (
                        <span className="flex-1 mx-3 text-casino-text text-xs">
                          Wheel → <span className="font-semibold" style={{
                            color: item.result === 'Jackpot' ? '#d4a574' :
                              item.result === 'Bonus' ? '#eab308' :
                              item.result === 'Tier 3' ? '#a855f7' :
                              item.result === 'Tier 2' ? '#3b82f6' :
                              '#ef4444'
                          }}>{item.result}</span>
                        </span>
                      )}
                      <span className="text-[10px] text-casino-text-tertiary uppercase tracking-wider shrink-0">
                        {item.type === 'habit' ? 'Habit' : item.type === 'reward-claimed' ? 'Claimed' : item.type === 'reward-completed' ? 'Done' : 'Spin'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop: Tabbed layout */}
        <div className="hidden lg:block">
          {/* Habits Tab */}
          {mobileView === 'habits' && (
            <div className="space-y-6 stagger-reveal">
              {/* Daily Stats */}
              {(() => {
                const today = new Date().toISOString().slice(0, 10);
                const completedToday = habits.filter((h) =>
                  h.completedDates.some((d) => d.startsWith(today))
                ).length;
                const earnedToday = history.filter(
                  (h) => h.type === 'habit' && h.timestamp.startsWith(today)
                ).length;
                const tokens = inventory.spinTokens || 0;
                return (
                  <div className="glass p-3 flex items-center justify-around text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-lg font-bold text-casino-accent tabular-nums">&#10003;{completedToday}</span>
                      <span className="text-[10px] text-casino-text-tertiary">Completed</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-lg font-bold text-casino-accent tabular-nums">&#9830;{earnedToday}</span>
                      <span className="text-[10px] text-casino-text-tertiary">Clips</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-lg font-bold text-casino-accent tabular-nums">{tokens}</span>
                      <span className="text-[10px] text-casino-text-tertiary">Tokens</span>
                    </div>
                  </div>
                );
              })()}
              <HabitList
                habits={habits}
                jars={jars}
                tags={allTags}
                onComplete={handleCompleteHabit}
                onEdit={handleEditHabit}
                onDelete={handleDeleteHabit}
                onAdd={() => setShowCreateHabit(true)}
                onQuickTask={() => setShowQuickTask(true)}
              />
              <ClipInventory clips={inventory.clips} activeTier={inventory.activeTier} lifetimeClips={inventory.lifetimeClips} onDeleteAll={handleDeleteAllClips} />
              <div data-tour="cash-in-area">
                {isCashingEligible(inventory.clips, inventory.activeTier) ? (
                  <button
                    onClick={() => { setCashingDefaultJarId(null); setShowCashing(true); }}
                    className="btn-pill btn-gold w-full"
                  >
                    <ArrowRightLeft size={16} />
                    Cash In Clips
                  </button>
                ) : (
                  <div className="glass py-3 px-4 text-center text-casino-text-tertiary text-xs">
                    Collect 2+ matching clips to cash in
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wheel Tab */}
          {mobileView === 'wheel' && (
            <div className="space-y-6 stagger-reveal">
              {!showBonusWheel ? (
                <div className="glass-float gold-foil p-8 flex flex-col items-center">
                <p className="font-heading text-sm text-white mb-6 tracking-tight">Spin the Wheel</p>
                  <MainWheel
                    activeTier={inventory.activeTier}
                    spinTokens={inventory.spinTokens || 0}
                    canMegaSpin={(inventory.spinTokens || 0) >= 5}
                    isFreeJackpotSpin={freeJackpotSpin}
                    onConsumeToken={handleConsumeToken}
                    onConsumeMegaToken={handleConsumeMegaToken}
                    onSpinComplete={handleSpinComplete}
                    onShowConfetti={() => setShowConfetti(true)}
                  />
                </div>
              ) : (
                <div className="glass-float gold-foil p-8 flex flex-col items-center">
                  <p className="text-sm font-semibold text-casino-success mb-6">Bonus Spin</p>
                  <BonusWheel
                    onBonusComplete={handleBonusComplete}
                    onShowConfetti={() => setShowConfetti(true)}
                    onExtraSpin={() => {
                      setInventory((prev) => {
                        const updated = { ...prev, spinTokens: (prev.spinTokens || 0) + 1 };
                        if (useApi) api.updateInventory(updated).catch(() => setUseApi(false));
                        return updated;
                      });
                      setShowBonusWheel(false);
                    }}
                  />
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass p-4 text-center">
                  <p className="text-2xl font-bold text-casino-accent tabular-nums">
                    {history.filter((h) => h.type === 'main-wheel').length}
                  </p>
                  <p className="text-xs text-casino-text-tertiary mt-1">Total Spins</p>
                </div>
                <div className="glass p-4 text-center">
                  <p className="text-2xl font-bold text-casino-accent tabular-nums">
                    {inventory.spinTokens || 0}
                  </p>
                  <p className="text-xs text-casino-text-tertiary mt-1">Spin Tokens</p>
                </div>
                <div className="glass p-4 text-center">
                  <p className="text-lg font-bold text-white truncate">
                    {(() => {
                      const spins = history.filter((h) => h.type === 'main-wheel');
                      if (spins.length === 0) return '—';
                      const last = spins[spins.length - 1];
                      return last.result || last.raw || '—';
                    })()}
                  </p>
                  <p className="text-xs text-casino-text-tertiary mt-1">Last Result</p>
                </div>
              </div>

              {/* Spin History Bar Chart */}
              <div className="glass p-5">
                <p className="font-heading text-sm text-white mb-4 tracking-tight">Spin History</p>
                {(() => {
                  const spinHistory = [...history]
                    .filter((h) => h.type === 'main-wheel')
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .slice(0, 10);
                  if (spinHistory.length === 0) return <p className="text-casino-text-tertiary text-center py-4 text-sm">No spins yet. Give it a go!</p>;
                  const tierColor = (r) => r === 'Jackpot' ? '#e8b931' : r === 'Bonus' ? '#eab308' : r === 'Tier 3' ? '#a855f7' : r === 'Tier 2' ? '#3b82f6' : '#ef4444';
                  const tierHeight = (r) => r === 'Jackpot' ? 48 : r === 'Bonus' ? 40 : r === 'Tier 3' ? 32 : r === 'Tier 2' ? 24 : 16;
                  const tierInitial = (r) => r === 'Jackpot' ? 'J' : r === 'Bonus' ? 'B' : r === 'Tier 3' ? '3' : r === 'Tier 2' ? '2' : '1';
                  return (
                    <div className="flex items-end justify-around gap-1 h-[60px] px-1">
                      {spinHistory.map((spin, i) => (
                        <div key={spin.id} className="flex flex-col items-center gap-1 flex-1 max-w-[32px]">
                          <div className="w-full rounded-t-md transition-all" style={{
                            height: `${tierHeight(spin.result)}px`,
                            backgroundColor: tierColor(spin.result),
                            opacity: 0.75,
                          }} />
                          <span className="text-[9px] font-bold tabular-nums" style={{ color: tierColor(spin.result) }}>
                            {tierInitial(spin.result)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Recent Spins */}
              <div className="glass p-5">
                <p className="font-heading text-sm text-white mb-4 tracking-tight">Recent Spins</p>
                {history.filter((h) => h.type === 'main-wheel').length === 0 ? (
                  <p className="text-casino-text-tertiary text-center py-4 text-sm">No spins yet. Give it a go!</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                    {[...history]
                      .filter((h) => h.type === 'main-wheel')
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      .slice(0, 10)
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-casino-card text-sm">
                          <span className="text-casino-text-tertiary text-xs tabular-nums shrink-0">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="flex-1 mx-3 text-casino-text text-xs">
                            {item.isMegaSpin ? 'Mega ' : ''}Wheel → <span className="font-semibold" style={{
                              color: item.result === 'Jackpot' ? '#d4a574' :
                                item.result === 'Bonus' ? '#eab308' :
                                item.result === 'Tier 3' ? '#a855f7' :
                                item.result === 'Tier 2' ? '#3b82f6' :
                                '#ef4444'
                            }}>{item.result}</span>
                          </span>
                          <span className="text-[10px] text-casino-text-tertiary uppercase tracking-wider shrink-0">
                            {item.raw !== item.result ? `${item.raw} → ${item.result}` : item.result}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rewards Tab */}
          {mobileView === 'rewards' && (
            <div className="stagger-reveal" data-tour="reward-bank">
              <div className="flex items-center justify-between mb-3">
                <p className="font-heading text-sm text-white tracking-tight">Unclaimed Rewards</p>
                <button
                  onClick={() => setShowRewardCatalog(true)}
                  className="btn-pill btn-ghost text-xs font-semibold"
                >
                  Edit Catalog
                </button>
              </div>
              <RewardBank
                rewards={unclaimedRewards}
                onClaim={handleClaimReward}
                onDeleteAll={handleDeleteAllRewards}
                onRequestConfirm={openConfirm}
              />
            </div>
          )}

          {/* Jars Tab */}
          {mobileView === 'jars' && (
            <div className="stagger-reveal">
              <div className="flex items-center justify-between mb-3">
                <p className="font-heading text-sm text-white tracking-tight">Jars</p>
                <button
                  onClick={() => setShowCreateJar(true)}
                  className="btn-ghost text-xs flex items-center gap-1.5 font-semibold" style={{ color: 'var(--color-casino-accent)' }}
                >
                  <Plus size={14} /> New
                </button>
              </div>
              <Jars jars={jars} habits={habits} history={history} onAddJar={() => setShowCreateJar(true)} onEditJar={handleEditJar} onDeleteJar={handleDeleteJar} />
            </div>
          )}

          {/* History Tab */}
          {mobileView === 'history' && (
            <div className="glass p-5 stagger-reveal">
              <div className="flex items-center justify-between mb-4">
                <p className="font-heading text-sm text-white tracking-tight">History</p>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="btn-pill btn-ghost text-xs flex items-center gap-1 text-casino-danger"
                  >
                    <Trash2 size={12} /> Clear
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <p className="text-casino-text-tertiary text-center py-8 text-sm">No activity yet. Complete a habit!</p>
              ) : (
                <div className="space-y-1.5 max-h-96 overflow-y-auto scrollbar-hide">
                  {[...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50).map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-casino-card text-sm">
                      <span className="text-casino-text-tertiary text-xs tabular-nums shrink-0">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {item.type === 'habit' ? (
                        <span className="flex-1 mx-3 text-casino-text text-xs">
                          Completed <span className="font-semibold text-casino-text">{item.habitName}</span>
                        </span>
                      ) : item.type === 'reward-claimed' ? (
                        <span className="flex-1 mx-3 text-casino-text text-xs">
                          Claimed <span className="font-semibold text-casino-success">{item.rewardName}</span>
                        </span>
                      ) : item.type === 'reward-completed' ? (
                        <span className="flex-1 mx-3 text-casino-text text-xs">
                          Finished <span className="font-semibold text-casino-accent">{item.rewardName}</span>
                        </span>
                      ) : item.type === 'quick-task' ? (
                        <span className="flex-1 mx-3 text-casino-text text-xs">
                          Quick <span className="font-semibold text-casino-text">{item.habitName}</span>
                        </span>
                      ) : (
                        <span className="flex-1 mx-3 text-casino-text text-xs">
                          {item.isMegaSpin ? 'Mega ' : ''}Wheel → <span className="font-semibold" style={{
                            color: item.result === 'Jackpot' ? '#d4a574' :
                              item.result === 'Bonus' ? '#eab308' :
                              item.result === 'Tier 3' ? '#a855f7' :
                              item.result === 'Tier 2' ? '#3b82f6' :
                              '#ef4444'
                          }}>{item.result}</span>
                        </span>
                      )}
                      <span className="text-[10px] text-casino-text-tertiary uppercase tracking-wider shrink-0">
                        {item.type === 'quick-task' ? 'Quick' : item.type === 'habit' ? 'Habit' : item.type === 'reward-claimed' ? 'Claimed' : item.type === 'reward-completed' ? 'Done' : 'Spin'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNav active={mobileView} onChange={setMobileView} unseenRewards={unseenRewards} />

      {/* Modals */}
      <AnimatePresence>
        {showTokenWheel && <TokenWheel onComplete={handleTokenWheelComplete} clipColor={lastClip} />}
        {showCashing && (
          <CashingSystem
            clips={inventory.clips}
            jars={jars}
            activeTier={inventory.activeTier}
            defaultJarId={cashingDefaultJarId}
            onCashIn={handleCashIn}
            onClose={() => { setShowCashing(false); setCashingDefaultJarId(null); }}
          />
        )}
        {showRewardPicker && (
          <RewardPicker
            tier={rewardPickerTier}
            choices={rewardPickerChoices}
            onSelect={(reward) => { addRewardToBank(reward, rewardPickerTier); setShowRewardPicker(false); }}
            onClose={() => setShowRewardPicker(false)}
          />
        )}
        {showRewardWon && wonReward && (
          <RewardWonModal reward={wonReward} tier={wonTier} onUseNow={handleUseRewardNow} onClaimLater={handleClaimRewardLater} />
        )}
        {showJackpotChoice && (
          <JackpotChoiceModal onSelect={handleJackpotChoice} onClose={() => setShowJackpotChoice(false)} />
        )}
        {showRewardCatalog && (
          <RewardCatalog catalog={rewardCatalog} onSave={handleSaveCatalog} onClose={() => setShowRewardCatalog(false)} />
        )}
      </AnimatePresence>

      {/* Jar Modals */}
      <AnimatePresence>
        {showCreateJar && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => setShowCreateJar(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="modal-panel" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-5 text-casino-text">New Jar</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-casino-text-tertiary mb-1.5 uppercase tracking-wider">Name</label>
                  <input type="text" value={newJarName} onChange={(e) => setNewJarName(e.target.value)} placeholder="e.g., Reading" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-casino-text-tertiary mb-1.5 uppercase tracking-wider">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316'].map((c) => (
                      <button key={c} onClick={() => setNewJarColor(c)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${newJarColor === c ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowCreateJar(false)} className="btn btn-secondary flex-1">Cancel</button>
                  <button onClick={handleCreateJar} className="btn btn-primary flex-1">Create</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditJar && editingJar && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => { setShowEditJar(false); setEditingJar(null); }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="modal-panel" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-5 text-casino-text">Edit Jar</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-casino-text-tertiary mb-1.5 uppercase tracking-wider">Name</label>
                  <input type="text" value={editingJar.name} onChange={(e) => setEditingJar({ ...editingJar, name: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-casino-text-tertiary mb-1.5 uppercase tracking-wider">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316'].map((c) => (
                      <button key={c} onClick={() => setEditingJar({ ...editingJar, color: c })}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${editingJar.color === c ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-casino-text-tertiary mb-2 uppercase tracking-wider">Milestones</label>
                  <div className="space-y-2">
                    {editingJar.milestones.map((m, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Trophy size={13} className="text-casino-text-tertiary shrink-0" />
                        <input type="number" value={m.target} onChange={(e) => updateEditingMilestone(idx, 'target', e.target.value)}
                          className="w-28 input text-sm py-1.5" />
                        <span className="text-casino-text-tertiary text-sm">=</span>
                        <input type="text" value={m.reward} onChange={(e) => updateEditingMilestone(idx, 'reward', e.target.value)}
                          className="flex-1 input text-sm py-1.5" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setShowEditJar(false); setEditingJar(null); }} className="btn btn-secondary flex-1">Cancel</button>
                  <button onClick={handleSaveEditJar} className="btn btn-primary flex-1">Save</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habit Modals */}
      <AnimatePresence>
        {showCreateHabit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => setShowCreateHabit(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="modal-panel" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-5 text-casino-text">New Habit</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-casino-text-tertiary mb-1.5 uppercase tracking-wider">Name</label>
                  <input type="text" value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} placeholder="e.g., Morning Run" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-casino-text-tertiary mb-1.5 uppercase tracking-wider">Description</label>
                  <input type="text" value={newHabitDesc} onChange={(e) => setNewHabitDesc(e.target.value)} placeholder="e.g., Run at least 2km" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-casino-text-tertiary mb-1.5 uppercase tracking-wider">Linked Jar</label>
                  <div className="flex gap-2">
                    <select value={newHabitJarId} onChange={(e) => setNewHabitJarId(e.target.value)} className="input flex-1">
                      {jars.map((jar) => <option key={jar.id} value={jar.id}>{jar.name}</option>)}
                    </select>
                    <button
                      onClick={() => { setShowCreateHabit(false); setShowCreateJar(true); }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center glass btn-ghost shrink-0"
                      title="Create new jar"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-casino-text-tertiary mb-1.5 uppercase tracking-wider">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316'].map((c) => (
                      <button key={c} onClick={() => setNewHabitColor(c)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${newHabitColor === c ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-casino-text-tertiary mb-1.5 uppercase tracking-wider">Tags</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {newHabitTags.map((tag, i) => (
                      <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-casino-accent/15 text-casino-accent">
                        {tag}
                        <button onClick={() => setNewHabitTags(newHabitTags.filter((_, j) => j !== i))} className="hover:text-white">&times;</button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add tag, press Enter"
                    className="input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        const val = e.target.value.trim();
                        if (!newHabitTags.includes(val)) setNewHabitTags([...newHabitTags, val]);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowCreateHabit(false)} className="btn btn-secondary flex-1">Cancel</button>
                  <button onClick={handleCreateHabit} className="btn btn-primary flex-1">Create</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditHabit && editingHabit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => { setShowEditHabit(false); setEditingHabit(null); }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="modal-panel" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-5 text-casino-text">Edit Habit</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-casino-text-tertiary mb-1.5 uppercase tracking-wider">Name</label>
                  <input type="text" value={editingHabit.name} onChange={(e) => setEditingHabit({ ...editingHabit, name: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-casino-text-tertiary mb-1.5 uppercase tracking-wider">Description</label>
                  <input type="text" value={editingHabit.description} onChange={(e) => setEditingHabit({ ...editingHabit, description: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-casino-text-tertiary mb-1.5 uppercase tracking-wider">Linked Jar</label>
                  <select value={editingHabit.jarId} onChange={(e) => setEditingHabit({ ...editingHabit, jarId: e.target.value })} className="input">
                    {jars.map((jar) => <option key={jar.id} value={jar.id}>{jar.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-casino-text-tertiary mb-1.5 uppercase tracking-wider">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316'].map((c) => (
                      <button key={c} onClick={() => setEditingHabit({ ...editingHabit, color: c })}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${editingHabit.color === c ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-casino-text-tertiary mb-1.5 uppercase tracking-wider">Tags</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(editingHabit.tags || []).map((tag, i) => (
                      <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-casino-accent/15 text-casino-accent">
                        {tag}
                        <button onClick={() => setEditingHabit({ ...editingHabit, tags: editingHabit.tags.filter((_, j) => j !== i) })} className="hover:text-white">&times;</button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add tag, press Enter"
                    className="input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        const val = e.target.value.trim();
                        const current = editingHabit.tags || [];
                        if (!current.includes(val)) setEditingHabit({ ...editingHabit, tags: [...current, val] });
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setShowEditHabit(false); setEditingHabit(null); }} className="btn btn-secondary flex-1">Cancel</button>
                  <button onClick={handleSaveEditHabit} className="btn btn-primary flex-1">Save</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti — rendered outside any transforms so fixed positioning works */}
      {/* Quick Task Modal */}
      <AnimatePresence>
        {showQuickTask && (
          <QuickTaskModal jars={jars} onComplete={handleQuickTaskComplete} onClose={() => setShowQuickTask(false)} />
        )}
        {onboardingPhase === 'modal' && (
          <OnboardingModal
            onStartTour={() => setOnboardingPhase('tour')}
            onSkip={() => setOnboardingPhase('complete')}
          />
        )}
      </AnimatePresence>

      {showConfetti && <JackpotConfetti />}
      {onboardingPhase === 'tour' && (
        <TourTooltip
          onComplete={() => setOnboardingPhase('complete')}
          onSkip={() => setOnboardingPhase('complete')}
        />
      )}
      {undoState && <UndoToast habitName={undoState.habit.name} secondsLeft={undoSeconds} onUndo={handleUndo} />}
      {clipToast && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          className="fixed bottom-32 md:bottom-20 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="glass px-4 py-2.5 rounded-2xl flex items-center gap-3 animate-in">
            <SingleClip color={clipToast.color} />
            <span className="text-sm font-medium text-white capitalize">{clipToast.color} clip!</span>
          </div>
        </motion.div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        danger={confirmModal.danger}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <SessionSummaryModal
        isOpen={sessionSummary.isOpen}
        habit={sessionSummary.habit}
        clip={sessionSummary.clip}
        tokenWon={sessionSummary.tokenWon}
        onDismiss={() => setSessionSummary(prev => ({ ...prev, isOpen: false }))}
      />
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        isMuted={isMuted}
        onToggleMute={() => { const newState = toggleMute(); setIsMuted(newState); }}
        onShowHelp={() => { setOnboardingPhase('modal'); setShowSettings(false); }}
        onExportData={() => {
          const data = { jars, habits, inventory, history, rewardCatalog };
          navigator.clipboard.writeText(JSON.stringify(data, null, 2));
          addToast('Data copied to clipboard', 'success');
        }}
        onResetData={() => {
          setShowSettings(false);
          openConfirm({
            title: 'Reset Everything?',
            message: 'This will erase all your habits, jars, clips, tokens, rewards and history. This cannot be undone.',
            danger: true,
            onConfirm: () => {
              handleResetAll();
              closeConfirm();
            },
          });
        }}
      />
    </div>
  );
}

export default App;