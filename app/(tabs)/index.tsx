import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import {
    Activity, BookOpen,
    Car,
    Check,
    ChevronRight,
    CircleCheck,
    CircleHelp,
    Clock,
    Coffee,
    Crown,
    Download,
    Flame,
    Hash,
    Heart,
    Home,
    KeyRound,
    ListChecks,
    Lock,
    MapPin,
    MessagesSquare,
    Mic,
    Package,
    Palette,
    Pencil,
    Plane,
    Scissors,
    ShoppingBag,
    ShoppingCart,
    Shirt,
    Smile,
    Sparkles,
    Sun,
    Trophy,
    User,
    Users,
    Utensils,
    WifiOff,
    DoorOpen,
    HandHelping,
} from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MilestoneModal from '../../components/MilestoneModal';
import SignUpPrompt from '../../components/SignUpPrompt';
import StreakModal from '../../components/StreakModal';
import Yusuf, { useMood } from '../../components/Yusuf';
import { getLevelFromXP } from '../../constants/levels';
import { theme } from '../../constants/theme';
import { useConnectivity } from '../../contexts/ConnectivityContext';
import { useDialect } from '../../contexts/DialectContext';
import { usePaywall } from '../../contexts/PaywallContext';
import { useXP } from '../../contexts/XPContext';
import { getDialectCurriculum, isSupportedCurriculumDialect, type CurriculumItem } from '../../data/curriculum';
import { TESTING_UNLOCK_ALL } from '../../utils/access';
import { getConnectivitySnapshot } from '../../utils/connectivity-state';
import { subscribeAuthenticatedProgress } from '../../utils/guest-xp-migration';
import { getLocalCompletionIds } from '../../utils/offline-progress';
import { getMissionDisplayTitle, getMissionIconKey, type MissionIconKey } from '../../utils/mission-display';
import { buildPhase1ReviewQuestions, getPhase1ReviewAttemptScope } from '../../utils/phase1-review';
import { getPaywallSourceForContentType } from '../../utils/premium';
import { recordPremiumDiagnostic } from '../../utils/premium-diagnostics';
import { hasCompletedContent } from '../../utils/progression';
import { getOrCreateQuizAttemptSeed } from '../../utils/quiz-attempt';
import { getResolvableDueCount } from '../../utils/srs';
import type { StreakData } from '../../utils/streak';
import { clearPendingMilestone, getLocalStreakData, getPendingMilestone } from '../../utils/streak';
import { supabase } from '../../utils/supabase';

let lastHomeScrollY = 0;

const YUSUF_TAP_WHISPERS = [
  'تكلم ولا تخاف',
  'كل يوم كلمة جديدة',
  'الخليجي سهل لما تسمعه كثير',
  'غلط وكمّل',
];

const DIALECT_LABELS: Record<string, string> = {
  gulf: 'Gulf Arabic',
  egyptian: 'Egyptian',
  msa: 'Modern Standard',
  maghrebi: 'Maghrebi',
};

const DIALECT_FLAGS: Record<string, string> = {
  gulf: '🇦🇪',
  egyptian: '🇪🇬',
  msa: '🌍',
  maghrebi: '🇲🇦',
};

function renderMissionIcon(iconKey: MissionIconKey, color = theme.colors.accentPrimary, size = 20) {
  switch (iconKey) {
    case 'circle-check': return <CircleCheck color={color} size={size} />;
    case 'circle-help': return <CircleHelp color={color} size={size} />;
    case 'coffee': return <Coffee color={color} size={size} />;
    case 'door-open': return <DoorOpen color={color} size={size} />;
    case 'hand-helping': return <HandHelping color={color} size={size} />;
    case 'hash': return <Hash color={color} size={size} />;
    case 'heart': return <Heart color={color} size={size} />;
    case 'home': return <Home color={color} size={size} />;
    case 'key': return <KeyRound color={color} size={size} />;
    case 'list-checks': return <ListChecks color={color} size={size} />;
    case 'map-pin': return <MapPin color={color} size={size} />;
    case 'messages-square': return <MessagesSquare color={color} size={size} />;
    case 'package': return <Package color={color} size={size} />;
    case 'palette': return <Palette color={color} size={size} />;
    case 'shirt': return <Shirt color={color} size={size} />;
    case 'smile': return <Smile color={color} size={size} />;
    case 'sparkles': return <Sparkles color={color} size={size} />;
    case 'sun': return <Sun color={color} size={size} />;
    case 'trophy': return <Trophy color={color} size={size} />;
    case 'user': return <User color={color} size={size} />;
    case 'users': return <Users color={color} size={size} />;
    default: return <BookOpen color={color} size={size} />;
  }
}

function getCurriculumIcon(item: CurriculumItem) {
  if (item.missionId || item.missionKind) return renderMissionIcon(getMissionIconKey(item));
  if (item.contentType === 'writing') return <Pencil color={theme.colors.accentPrimary} size={20} />;
  if (item.contentType === 'quiz') return renderMissionIcon(getMissionIconKey(item));
  if (item.contentType === 'lesson') {
    if (item.contentId.startsWith('numbers-') || item.contentId.startsWith('grammar-')) {
      return <Hash color={theme.colors.accentPrimary} size={20} />;
    }
    if (item.contentId.startsWith('work-') || item.contentId.startsWith('social-')) {
      return <Hash color={theme.colors.accentPrimary} size={20} />;
    }
    if (item.contentId === 'greetings') return <Mic color={theme.colors.accentPrimary} size={20} />;
    if (item.contentId === 'intro') return <User color={theme.colors.accentPrimary} size={20} />;
    return <BookOpen color={theme.colors.accentPrimary} size={20} />;
  }

  switch (item.contentId) {
    case 'cafe':
      return <Coffee color={theme.colors.accentPrimary} size={20} />;
    case 'taxi':
      return <Car color={theme.colors.accentPrimary} size={20} />;
    case 'hotel':
      return <ShoppingBag color={theme.colors.accentPrimary} size={20} />;
    case 'restaurant':
      return <Utensils color={theme.colors.accentPrimary} size={20} />;
    case 'supermarket':
      return <ShoppingCart color={theme.colors.accentPrimary} size={20} />;
    case 'pharmacy':
    case 'doctorvisit':
    case 'hospitalemergency':
      return <Heart color={theme.colors.accentPrimary} size={20} />;
    case 'barbershop':
      return <Scissors color={theme.colors.accentPrimary} size={20} />;
    case 'airport':
      return <Plane color={theme.colors.accentPrimary} size={20} />;
    case 'morningroutine':
    case 'fridaygathering':
    case 'neighborvisit':
      return <Coffee color={theme.colors.accentPrimary} size={20} />;
    case 'atgym':
      return <Activity color={theme.colors.accentPrimary} size={20} />;
    case 'cookinghome':
      return <Utensils color={theme.colors.accentPrimary} size={20} />;
    default:
      return <MapPin color={theme.colors.accentPrimary} size={20} />;
  }
}

function getCurriculumItemMeta(item: CurriculumItem, itemIndex: number, itemCount: number) {
  if (item.contentType === 'quiz') return item.subtitle ?? 'Test what you learned';
  const prefix = item.contentType === 'writing' ? 'Lesson' : 'Lesson';
  return `${prefix} ${itemIndex + 1} of ${itemCount}${item.subtitle ? ` · ${item.subtitle}` : ''}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [userName, setUserName] = useState('Friend');
  const [streakCount, setStreakCount] = useState(0);
  const [scenarioProgress, setScenarioProgress] = useState<Record<string, boolean>>({});
  const [xpTotal, setXpTotal] = useState(0);
  const [isGuest, setIsGuest] = useState(false);
  const [lessonsToday, setLessonsToday] = useState(0);
  const [level, setLevel] = useState('beginner');
  const { dialect: contextDialect, content, setDialect: setContextDialect } = useDialect();
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);
  const [promptReason, setPromptReason] = useState('');
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [pendingMilestone, setPendingMilestone] = useState<number | null>(null);
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0, longestStreak: 0, lastActiveDate: null, activeDates: [],
  });
  const [dueReviewCount, setDueReviewCount] = useState(0);
  const [progressRevision, setProgressRevision] = useState(0);
  const { isOnline, offlinePacks, currentDialectOfflineReady } = useConnectivity();

  // Freemium state — XP and premium come from XPContext (shared, no extra fetch)
  const { xp: xpFromContext, premiumStatus, getAccess } = useXP();
  const { openPaywall } = usePaywall();
  const isPremium = premiumStatus === 'premium';
  const isPremiumLoading = premiumStatus === 'loading';

  const [yusufMood, setYusufMood] = useMood('waving');
  const [yusufWhisper, setYusufWhisper] = useState<string | undefined>(undefined);
  const lastWhisperIdxRef = useRef<number>(-1);
  const celebrateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Reset transient celebrate timer on each evaluation.
    if (celebrateTimerRef.current) {
      clearTimeout(celebrateTimerRef.current);
      celebrateTimerRef.current = null;
    }

    // Priority 1: 2+ days since last practice → "where've you been?"
    const last = streakData.lastActiveDate;
    if (last) {
      const lastMs = new Date(last + 'T00:00:00').getTime();
      const days = Math.floor((Date.now() - lastMs) / 86400000);
      if (days >= 2) {
        setYusufMood('thinking');
        setYusufWhisper('وين كنت؟ 😄');
        return;
      }
    }

    // Priority 2: completed at least one lesson today → celebrate briefly.
    if (lessonsToday >= 1) {
      setYusufMood('celebrating');
      celebrateTimerRef.current = setTimeout(() => setYusufMood('waving'), 2000);
    }
  }, [streakData.lastActiveDate, lessonsToday, setYusufMood]);

  useEffect(() => () => {
    if (celebrateTimerRef.current) clearTimeout(celebrateTimerRef.current);
  }, []);

  useEffect(() => {
    setXpTotal(xpFromContext);
  }, [xpFromContext]);

  useEffect(() => subscribeAuthenticatedProgress(async eventUserId => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user.id === eventUserId) {
      setProgressRevision(revision => revision + 1);
    }
  }), []);

  useEffect(() => {
    recordPremiumDiagnostic({
      operation: 'home.render_status',
      source: 'home_render',
      previousPremiumStatus: premiumStatus,
      nextPremiumStatus: premiumStatus,
      accepted: true,
      updatesPremiumState: false,
    });
  }, [premiumStatus]);

  const handleYusufTap = () => {
    let next: number;
    do {
      next = Math.floor(Math.random() * YUSUF_TAP_WHISPERS.length);
    } while (next === lastWhisperIdxRef.current && YUSUF_TAP_WHISPERS.length > 1);
    lastWhisperIdxRef.current = next;
    setYusufWhisper(YUSUF_TAP_WHISPERS[next]);
  };

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // XP and premium come from XPContext — no extra fetch needed
          setXpTotal(xpFromContext);

          const connectivity = getConnectivitySnapshot();
          const canUseNetwork = !connectivity.isHydrated || connectivity.isOnline;
          const { data: user } = canUseNetwork
            ? await supabase
                .from('users')
                .select('streak_count, dialect, level, name')
                .eq('id', session.user.id)
                .maybeSingle()
            : { data: null };

          if (user) {
            setStreakCount(user.streak_count ?? 0);
            const serverDialect = user.dialect ?? 'gulf';
            if (serverDialect !== contextDialect) {
              setContextDialect(serverDialect);
            }
            setLevel(user.level ?? 'beginner');
            if (user.name) setUserName(user.name);
          }

          const storedName = await AsyncStorage.getItem('wizard_name');
          if (storedName) setUserName(storedName.split(' ')[0]);

          const { data: progress, error: progressError } = canUseNetwork
            ? await supabase
                .from('scenario_progress')
                .select('scenario_id, completed_count')
                .eq('user_id', session.user.id)
            : { data: null, error: null };

          const map: Record<string, boolean> = {};
          if (progress) {
            progress.forEach(p => {
              if ((p.completed_count ?? 0) > 0) map[p.scenario_id] = true;
            });
          }
          if (progressError) console.warn('[progress] Failed to load signed-in completions:', progressError);
          (await getLocalCompletionIds(session.user.id)).forEach(id => { map[id] = true; });
          if (__DEV__) console.log('[progress] Loaded completions:', map);
          setScenarioProgress(map);

          const todayStr = new Date().toISOString().split('T')[0];
          const { data: todayProgress } = canUseNetwork
            ? await supabase
                .from('scenario_progress')
                .select('id')
                .eq('user_id', session.user.id)
                .gt('completed_count', 0)
                .gte('last_completed', todayStr)
            : { data: null };

          setLessonsToday(todayProgress?.length ?? 0);
        } else {
          const name = await AsyncStorage.getItem('wizard_name');
          if (name) setUserName(name.split(' ')[0]);
          const d = await AsyncStorage.getItem('wizard_dialect');
          const l = await AsyncStorage.getItem('wizard_level');
          if (d && d !== contextDialect) setContextDialect(d);
          if (l) setLevel(l);
          const guestProg = await AsyncStorage.getItem('guest_progress');
          setScenarioProgress(guestProg ? JSON.parse(guestProg) : {});
          const expiry = await AsyncStorage.getItem('guest_expiry_warning');
          if (expiry === 'true') setShowExpiryWarning(true);
          setIsGuest(true);
        }

        // Load streak data (local AsyncStorage, fast)
        const localStreak = await getLocalStreakData();
        setStreakData(localStreak);
        setStreakCount(localStreak.currentStreak);

        // Check for pending milestone celebration
        const milestone = await getPendingMilestone();
        if (milestone) {
          await clearPendingMilestone();
          setPendingMilestone(milestone);
          setShowMilestoneModal(true);
        }

      };

      loadData();

      const restoreTimer = setTimeout(() => {
        if (lastHomeScrollY > 0) {
          scrollRef.current?.scrollTo({ y: lastHomeScrollY, animated: false });
        }
      }, 100);

      return () => clearTimeout(restoreTimer);
    }, [progressRevision])
  );

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const loadResolvableReviewCount = async () => {
        try {
          const attemptSeed = await getOrCreateQuizAttemptSeed(getPhase1ReviewAttemptScope(contextDialect));
          const candidates = buildPhase1ReviewQuestions(content, contextDialect, attemptSeed);
          const due = await getResolvableDueCount(candidates.map(question => question.id));
          if (!cancelled) setDueReviewCount(due);
        } catch (error) {
          console.warn('[review] Failed to resolve due items:', error);
          if (!cancelled) setDueReviewCount(0);
        }
      };
      loadResolvableReviewCount();
      return () => {
        cancelled = true;
      };
    }, [content, contextDialect])
  );

  // When TESTING_UNLOCK_ALL is true, treat every user as logged-in with no prerequisites
  const effectiveIsGuest = TESTING_UNLOCK_ALL ? false : isGuest;

  const completedContentIds = () => Object.keys(scenarioProgress).filter(id => scenarioProgress[id]);
  const isDone = (id: string, unitId?: string) => hasCompletedContent(contextDialect, id, completedContentIds(), unitId);
  const activeUnits = useMemo(() => {
    if (!isSupportedCurriculumDialect(contextDialect)) return [];
    return getDialectCurriculum(contextDialect).units
      .map(unit => ({
        ...unit,
        items: unit.items.filter(item => item.availability !== 'unavailable'),
      }))
      .filter(unit => unit.items.length > 0);
  }, [contextDialect]);
  const activeCurriculumItems = useMemo(
    () => activeUnits.flatMap(unit => unit.items),
    [activeUnits]
  );
  const firstCurriculumContentId = activeCurriculumItems[0]?.contentId ?? null;
  const getAccessForItem = (item: CurriculumItem) => getAccess({
    contentId: item.contentId,
    unitId: item.unitId,
    contentType: item.contentType,
    dialect: contextDialect,
    completedContentIds: completedContentIds(),
  });

  const showProgressionLock = (item: CurriculumItem) => {
    const requiredPrevious = getAccessForItem(item).requiredPreviousContentId;
    Alert.alert(
      'Complete previous lesson',
      requiredPrevious
        ? `${getMissionDisplayTitle(item.title)} unlocks after you complete the previous activity.`
        : `${getMissionDisplayTitle(item.title)} is not available yet.`
    );
    return true;
  };

  /** Returns the freemium tier for a content item (used for lock overlay badges). */
  type FreemiumTier = 'accessible' | 'premium_only';
  const getFreemiumTier = (item: CurriculumItem): FreemiumTier => {
    if (TESTING_UNLOCK_ALL || isPremium) return 'accessible';
    return getAccessForItem(item).reason === 'premium_required' ? 'premium_only' : 'accessible';
  };

  /** Show the paywall modal for a piece of freemium-gated content. */
  const showPaywall = (item: CurriculumItem) => {
    const tier = getFreemiumTier(item);
    if (tier === 'accessible') return false; // caller should proceed
    openPaywall(getPaywallSourceForContentType(item.contentType), { contentLabel: getMissionDisplayTitle(item.title) });
    return true; // caller should stop
  };

  const questComplete = lessonsToday >= 1;
  const dialectFlag = DIALECT_FLAGS[contextDialect] ?? '🌍';
  const dialectLabel = DIALECT_LABELS[contextDialect] ?? contextDialect;
  const currentLevel = getLevelFromXP(xpTotal);
  const activeOfflineDialect = (contextDialect === 'egyptian' || contextDialect === 'msa' ? contextDialect : 'gulf') as 'gulf' | 'egyptian' | 'msa';
  const activeOfflinePack = offlinePacks[activeOfflineDialect];
  const offlineCardTitle = isPremium
    ? currentDialectOfflineReady
      ? `${dialectLabel} is ready offline`
      : `Prepare ${dialectLabel} for offline use`
    : 'Offline audio is premium only';
  const offlineCardMeta = isPremium
    ? currentDialectOfflineReady
      ? `${activeOfflinePack.assetCount} files cached for your current dialect`
      : 'Download the current dialect pack in Profile before going offline'
    : 'Members can prepare dialect packs and keep learning without internet';
  const offlineBadgeLabel = isOnline ? 'Online' : 'Offline';
  const offlineBadgeIcon = isOnline ? <Download color={theme.colors.textAccent} size={13} /> : <WifiOff color={theme.colors.accentWarm} size={13} />;

  const getContentLock = (item: CurriculumItem): 'premium' | undefined =>
    getAccessForItem(item).reason === 'premium_required' ? 'premium' : undefined;
  // Convenience: show paywall for a content item (returns true = blocked)
  const paywallGuard = (item: CurriculumItem) => {
    const access = getAccessForItem(item);
    if (access.allowed) return false;
    if (access.reason === 'previous_incomplete' || access.reason === 'unavailable') return showProgressionLock(item);
    return showPaywall(item);
  };

  // Continue card — points to first incomplete lesson in the curriculum.
  const completedInPath = activeCurriculumItems.filter(item => isDone(item.contentId, item.unitId)).length;
  const nextInPath = activeCurriculumItems.find(item => !isDone(item.contentId, item.unitId)) ?? activeCurriculumItems[0];
  const continuePercent = activeCurriculumItems.length > 0
    ? Math.round((completedInPath / activeCurriculumItems.length) * 100)
    : 0;
  const continueTitle = completedInPath === activeCurriculumItems.length ? 'Keep practising' : getMissionDisplayTitle(nextInPath?.title ?? 'Start learning');
  const continueMeta = activeUnits.find(unit => unit.unitId === nextInPath?.unitId)?.title ?? dialectLabel;
  const continueHref = nextInPath?.homeHref ?? '/(tabs)';

  const handleCurriculumItemPress = (item: CurriculumItem) => {
    if (effectiveIsGuest && item.contentId !== firstCurriculumContentId) {
      setPromptReason('unlock all lessons');
      setShowSignUpPrompt(true);
      return;
    }
    if (paywallGuard(item)) return;
    router.push(item.homeHref as any);
  };

  const renderCurriculumItem = (item: CurriculumItem, itemIndex: number, itemCount: number) => {
    const access = getAccessForItem(item);
    const done = isDone(item.contentId, item.unitId);
    const status = done ? 'completed' : access.allowed ? 'current' : 'locked';
    const isPremiumLocked = access.reason === 'premium_required';
    const meta = getCurriculumItemMeta(item, itemIndex, itemCount);
    const displayTitle = getMissionDisplayTitle(item.title);

    if (item.contentType === 'quiz') {
      const unlocked = access.allowed;
      return (
        <Pressable
          key={item.contentId}
          style={[styles.quizButton, !unlocked && styles.quizButtonLocked, done && styles.quizButtonDone]}
          onPress={() => handleCurriculumItemPress(item)}
          accessibilityLabel={displayTitle}
        >
          <View style={styles.quizButtonIcon}>
            {done
              ? <CircleCheck color={theme.colors.accentSuccess} size={22} />
              : renderMissionIcon(getMissionIconKey(item), unlocked ? theme.colors.accentPrimary : theme.colors.textTertiary, 22)}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.quizButtonTitle, !unlocked && { color: theme.colors.textTertiary }]}>{displayTitle}</Text>
            <Text style={[styles.quizButtonSub, !unlocked && { color: theme.colors.textTertiary }]}>
              {effectiveIsGuest && item.contentId !== firstCurriculumContentId ? 'Create account to unlock' : meta}
            </Text>
          </View>
          {done
            ? <Check color={theme.colors.accentSuccess} size={20} />
            : unlocked
              ? <ChevronRight color={theme.colors.accentPrimary} size={20} />
              : <Lock color={theme.colors.textTertiary} size={18} />}
        </Pressable>
      );
    }

    return (
      <LessonRow
        key={item.contentId}
        label={displayTitle}
        meta={meta}
        icon={getCurriculumIcon(item)}
        status={status}
        guestLocked={effectiveIsGuest && item.contentId !== firstCurriculumContentId}
        freemiumLock={isPremiumLocked && !effectiveIsGuest ? getContentLock(item) : undefined}
        onPress={() => handleCurriculumItemPress(item)}
        onLockedPress={() => handleCurriculumItemPress(item)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={100}
        onScroll={(event) => {
          lastHomeScrollY = event.nativeEvent.contentOffset.y;
        }}
      >

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting} numberOfLines={1} ellipsizeMode="tail">
              <Text style={styles.greetingAhlan}>Ahlan, </Text>
              {userName}
            </Text>
            <View style={styles.identityMetaRow}>
              <Text style={styles.dialectBadge}>{dialectFlag} {dialectLabel} · {currentLevel.name}</Text>
              {isPremium && (
                <View style={styles.headerPremiumBadge}>
                  <Crown color={theme.colors.accentWarm} size={11} />
                  <Text style={styles.headerPremiumBadgeText}>PREMIUM</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              style={[styles.statPill, streakCount === 0 && styles.statPillDim]}
              onPress={() => setShowStreakModal(true)}
            >
              <Flame
                color={streakCount > 0 ? theme.colors.accentWarm : theme.colors.textTertiary}
                size={14}
                fill={streakCount > 0 ? theme.colors.accentWarm : 'transparent'}
              />
              <Text style={[styles.statPillText, streakCount === 0 && { color: theme.colors.textTertiary }]}>
                {streakCount}
              </Text>
            </Pressable>
            <View style={styles.statPill}>
              <Text style={{ fontSize: 13 }}>{currentLevel.icon}</Text>
              <Text style={styles.statPillText}>{xpTotal}</Text>
            </View>
          </View>
        </View>

        {isPremium && (
          <View style={styles.premiumActiveCard}>
            <View style={styles.premiumActiveIcon}>
              <Crown color={theme.colors.accentWarm} size={17} />
            </View>
            <View style={styles.premiumActiveCopy}>
              <Text style={styles.premiumActiveTitle}>Premium active</Text>
              <Text style={styles.premiumActiveMeta}>Your complete Arabic journey is unlocked.</Text>
            </View>
            <Check color={theme.colors.accentSuccess} size={18} />
          </View>
        )}

        {/* Guest banner (guests only) */}
        {isGuest && !showExpiryWarning && (
          <Pressable
            style={styles.guestBanner}
            onPress={() => router.push('/login' as any)}
          >
            <Text style={styles.guestBannerText}>
              💾 Save your progress — Sign in or create account →
            </Text>
          </Pressable>
        )}

        {/* Expiry warning banner */}
        {isGuest && showExpiryWarning && (
          <Pressable
            style={styles.expiryBanner}
            onPress={() => { setPromptReason('save your progress'); setShowSignUpPrompt(true); }}
          >
            <Text style={styles.expiryBannerText}>
              ⚠️ Your progress expires soon. Save it now →
            </Text>
          </Pressable>
        )}

        {/* Yusuf — welcome coach */}
        <Pressable
          onPress={handleYusufTap}
          style={styles.yusufContainer}
          hitSlop={8}
        >
          <Yusuf mood={yusufMood} size="md" whisper={yusufWhisper} />
        </Pressable>

        {/* Continue hero card */}
        <Pressable
          style={styles.continueCard}
          onPress={() => router.push(continueHref as any)}
        >
          <View style={styles.continueGlow} pointerEvents="none" />
          <View style={styles.continueHeader}>
            <View style={styles.continueIconWell}>
              <Mic color={theme.colors.accentPrimary} size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.continueLabel}>CONTINUE</Text>
              <Text style={styles.continueTitle}>{continueTitle}</Text>
            </View>
          </View>
          <Text style={styles.continueMeta}>{continueMeta}</Text>
          <View style={styles.continueProgressRow}>
            <View style={styles.continueProgressBg}>
              <View style={[styles.continueProgressFill, { width: `${continuePercent}%` }]} />
            </View>
            <Text style={styles.continuePercent}>{continuePercent}%</Text>
          </View>
        </Pressable>

        {isPremiumLoading ? (
          <View style={styles.premiumHydrationCard} accessibilityLabel="Checking membership access">
            <ActivityIndicator color={theme.colors.textTertiary} size="small" />
            <View style={styles.premiumHydrationCopy}>
              <View style={[styles.premiumHydrationLine, { width: '42%' }]} />
              <View style={[styles.premiumHydrationLine, { width: '72%' }]} />
            </View>
          </View>
        ) : <Pressable
          style={[styles.offlineStatusCard, currentDialectOfflineReady && styles.offlineStatusCardReady]}
          onPress={() => {
            if (isPremium) {
              router.push('/(tabs)/profile' as any);
            } else {
              openPaywall('offline_audio', { contentLabel: 'Offline audio packs' });
            }
          }}
        >
          <View style={styles.offlineStatusHeader}>
            <View style={[styles.offlineStatusIconWell, currentDialectOfflineReady && styles.offlineStatusIconWellReady]}>
              {isPremium ? (
                currentDialectOfflineReady
                  ? <Download color={theme.colors.accentSuccess} size={18} />
                  : <Crown color={theme.colors.accentWarm} size={18} />
              ) : (
                <Lock color={theme.colors.accentWarm} size={18} />
              )}
            </View>
            <View style={styles.offlineStatusCopy}>
              <Text style={styles.offlineStatusLabel}>OFFLINE AUDIO</Text>
              <Text style={styles.offlineStatusTitle}>{offlineCardTitle}</Text>
            </View>
            <View style={styles.offlineStatusBadge}>
              {offlineBadgeIcon}
              <Text style={[styles.offlineStatusBadgeText, !isOnline && styles.offlineStatusBadgeTextOffline]}>{offlineBadgeLabel}</Text>
            </View>
          </View>
          <Text style={styles.offlineStatusMeta}>{offlineCardMeta}</Text>
        </Pressable>}

        {/* Daily Quest — single row */}
        <View style={styles.questCard}>
          <View style={styles.questIconWell}>
            <Activity color={questComplete ? theme.colors.accentSuccess : theme.colors.accentPrimary} size={18} />
          </View>
          <View style={styles.questBody}>
            <Text style={styles.questLabel}>DAILY QUEST</Text>
            <Text style={styles.questTitle}>
              {questComplete ? 'Quest complete!' : 'Complete 1 lesson today'}
            </Text>
          </View>
          <Text style={[styles.questFraction, questComplete && { color: theme.colors.accentSuccess }]}>
            {questComplete ? '✓' : '0 / 1'}
          </Text>
        </View>

        <Text style={styles.pathLabel}>YOUR PATH</Text>

        {/* Daily Review card — only shown when SRS items are due */}
        {dueReviewCount > 0 && !effectiveIsGuest && (
          <Pressable
            style={styles.reviewCard}
            onPress={() => router.push('/quiz-unit2?unit=review' as any)}
          >
            <View style={styles.reviewIconWell}>
              <Text style={{ fontSize: 18 }}>🔁</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.reviewLabel}>DAILY REVIEW</Text>
              <Text style={styles.reviewTitle}>
                {dueReviewCount} item{dueReviewCount !== 1 ? 's' : ''} due for practice
              </Text>
            </View>
            <View style={styles.reviewBadge}>
              <Text style={styles.reviewBadgeText}>{dueReviewCount}</Text>
            </View>
          </Pressable>
        )}

        {isPremiumLoading ? (
          <View style={styles.pathHydration} accessibilityLabel="Checking lesson access">
            {[0, 1, 2].map(index => (
              <View key={index} style={styles.pathHydrationRow}>
                <View style={styles.pathHydrationIcon} />
                <View style={styles.premiumHydrationCopy}>
                  <View style={[styles.premiumHydrationLine, { width: index === 1 ? '56%' : '44%' }]} />
                  <View style={[styles.premiumHydrationLine, { width: '70%' }]} />
                </View>
              </View>
            ))}
          </View>
        ) : activeUnits.map(unit => {
          const itemCount = unit.items.length;
          return (
            <View key={unit.unitId}>
              <View style={styles.unitRow}>
                <Text style={styles.unitTitle}>{unit.title}</Text>
                {unit.subtitle ? <Text style={styles.unitSubtitle}>{unit.subtitle}</Text> : null}
              </View>
              {unit.items.map((item, index) => (
                <View key={item.contentId}>
                  {renderCurriculumItem(item, index, itemCount)}
                  {index < itemCount - 1 && (
                    <View style={[styles.lessonConnector, isDone(item.contentId, item.unitId) && styles.lessonConnectorDone]} />
                  )}
                </View>
              ))}
            </View>
          );
        })}

      </ScrollView>

      <SignUpPrompt
        visible={showSignUpPrompt && !TESTING_UNLOCK_ALL}
        onClose={() => setShowSignUpPrompt(false)}
        reason={promptReason}
      />

      <StreakModal
        visible={showStreakModal}
        streakData={streakData}
        onClose={() => setShowStreakModal(false)}
      />

      <MilestoneModal
        visible={showMilestoneModal}
        milestone={pendingMilestone}
        onClose={() => setShowMilestoneModal(false)}
      />

    </SafeAreaView>
  );
}

function LessonRow({ label, meta, icon, status, onPress, guestLocked, comingSoon, freemiumLock, onLockedPress }: {
  label: string;
  meta: string;
  icon: any;
  status: 'completed' | 'current' | 'locked';
  onPress?: () => void;
  guestLocked?: boolean;
  comingSoon?: boolean;
  freemiumLock?: 'premium';
  /** Called when the row is tapped while freemiumLock is set. Show paywall here. */
  onLockedPress?: () => void;
}) {
  const effectiveStatus = comingSoon ? 'locked' : (freemiumLock ? 'locked' : status);
  const isActive = effectiveStatus === 'current';
  const isCompleted = effectiveStatus === 'completed';
  const isLocked = effectiveStatus === 'locked';

  let effectiveMeta = meta;
  if (comingSoon) effectiveMeta = 'Coming Soon';
  else if (freemiumLock === 'premium') effectiveMeta = 'Premium only';
  else if (isLocked && guestLocked) effectiveMeta = 'Sign up to unlock';
  else if (isLocked) effectiveMeta = 'Complete previous lesson';

  const handlePress = comingSoon
    ? undefined
    : freemiumLock
      ? onLockedPress
      : isLocked && !guestLocked
        ? undefined
      : onPress;

  return (
    <Pressable
      style={[
        styles.lessonRow,
        isActive && styles.lessonRowActive,
        isLocked && styles.lessonRowLocked,
        freemiumLock === 'premium' && styles.lessonRowPremium,
      ]}
      onPress={handlePress}
      accessibilityLabel={label}
    >
      <View style={[
        styles.lessonIconWell,
        isActive && styles.lessonIconWellActive,
        freemiumLock === 'premium' && styles.lessonIconWellPremium,
      ]}>
        {isCompleted
          ? <Check color={theme.colors.accentSuccess} size={18} />
          : freemiumLock === 'premium'
            ? <Crown color="#F59E0B" size={16} />
            : isLocked
              ? <Lock color={theme.colors.textTertiary} size={16} />
              : icon}
      </View>
      <View style={styles.lessonMiddle}>
        <Text style={styles.lessonLabel}>{label}</Text>
        <Text style={[styles.lessonMeta, isActive && styles.lessonMetaActive]}>
          {effectiveMeta}
        </Text>
      </View>
      {isActive && !comingSoon && !freemiumLock && <ChevronRight color={theme.colors.textAccent} size={18} />}
      {isLocked && !comingSoon && !freemiumLock && <Lock color={theme.colors.textTertiary} size={16} />}
      {freemiumLock === 'premium' && (
        <View style={styles.premiumBadge}>
          <Crown color="#F59E0B" size={11} />
          <Text style={styles.premiumBadgeText}>PRO</Text>
        </View>
      )}
      {comingSoon && <Clock color={theme.colors.textTertiary} size={16} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bgBase },
  scroll: { padding: theme.spacing.xl, paddingBottom: 120 },

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.xl },
  headerLeft: { flex: 1 },
  greeting: { fontSize: theme.fontSize.display, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary },
  greetingAhlan: { color: theme.colors.textAccent, fontWeight: theme.fontWeight.medium },
  identityMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: theme.spacing.xs },
  dialectBadge: { fontSize: theme.fontSize.body, color: theme.colors.textSecondary, fontWeight: theme.fontWeight.regular },
  headerPremiumBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: theme.radii.pill, paddingHorizontal: 7, paddingVertical: 3, backgroundColor: `${theme.colors.accentWarm}16`, borderWidth: 1, borderColor: `${theme.colors.accentWarm}55` },
  headerPremiumBadgeText: { color: theme.colors.accentWarm, fontSize: 9, fontWeight: theme.fontWeight.medium },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, paddingTop: theme.spacing.xs },
  statPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.bgSurface, borderWidth: 1, borderColor: theme.colors.borderDefault, borderRadius: theme.radii.pill, paddingHorizontal: theme.spacing.md, paddingVertical: 6, gap: theme.spacing.xs },
  statPillDim: { opacity: 0.5 },
  statPillText: { color: theme.colors.textPrimary, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.medium },

  premiumActiveCard: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.md, marginTop: -theme.spacing.sm, marginBottom: theme.spacing.md, borderRadius: theme.radii.md, borderWidth: 1, borderColor: `${theme.colors.accentWarm}44`, backgroundColor: `${theme.colors.accentWarm}08` },
  premiumActiveIcon: { width: 34, height: 34, borderRadius: theme.radii.xs, alignItems: 'center', justifyContent: 'center', backgroundColor: `${theme.colors.accentWarm}16` },
  premiumActiveCopy: { flex: 1 },
  premiumActiveTitle: { color: theme.colors.textPrimary, fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.medium },
  premiumActiveMeta: { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption, marginTop: 2 },
  premiumHydrationCard: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.bgSurface,
  },
  premiumHydrationCopy: { flex: 1, gap: 8 },
  premiumHydrationLine: { height: 9, borderRadius: 4, backgroundColor: theme.colors.bgElevated },
  pathHydration: { gap: 10 },
  pathHydrationRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.bgSurface,
  },
  pathHydrationIcon: { width: 32, height: 32, borderRadius: theme.radii.xs, backgroundColor: theme.colors.bgElevated },

  // Banners
  guestBanner: { backgroundColor: theme.colors.bgSurface, borderLeftWidth: 3, borderLeftColor: theme.colors.accentPrimary, borderRadius: theme.radii.xs, padding: theme.spacing.md, marginBottom: theme.spacing.lg },
  guestBannerText: { color: theme.colors.textAccent, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.regular },
  expiryBanner: { backgroundColor: theme.colors.bgSurface, borderLeftWidth: 3, borderLeftColor: theme.colors.accentWarm, borderRadius: theme.radii.xs, padding: theme.spacing.md, marginBottom: theme.spacing.lg },
  expiryBannerText: { color: theme.colors.accentWarm, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.regular },

  // Yusuf welcome coach
  yusufContainer: { alignItems: 'center', marginTop: -theme.spacing.sm, marginBottom: theme.spacing.sm },

  // Continue hero
  continueCard: { backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, padding: theme.spacing.xl, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.borderDefault, overflow: 'hidden', position: 'relative' },
  continueGlow: { position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(61, 212, 192, 0.08)' },
  continueHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.sm },
  continueIconWell: { width: 48, height: 48, borderRadius: theme.radii.sm, backgroundColor: theme.colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  continueLabel: { fontSize: theme.fontSize.label, color: theme.colors.textAccent, fontWeight: theme.fontWeight.medium, letterSpacing: 1.5 },
  continueTitle: { fontSize: theme.fontSize.title, color: theme.colors.textPrimary, fontWeight: theme.fontWeight.medium, marginTop: 2 },
  continueMeta: { fontSize: theme.fontSize.caption, color: theme.colors.textSecondary, marginTop: theme.spacing.xs, marginLeft: 60 },
  continueProgressRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.md },
  continueProgressBg: { flex: 1, height: 6, backgroundColor: theme.colors.bgBase, borderRadius: theme.radii.pill, overflow: 'hidden' },
  continueProgressFill: { height: '100%', backgroundColor: theme.colors.accentPrimary, borderRadius: theme.radii.pill },
  continuePercent: { fontSize: theme.fontSize.caption, color: theme.colors.textAccent, fontWeight: theme.fontWeight.medium, minWidth: 32, textAlign: 'right' },

  // Offline status
  offlineStatusCard: { backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.md, padding: theme.spacing.lg, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.borderDefault },
  offlineStatusCardReady: { borderColor: `${theme.colors.accentSuccess}55`, backgroundColor: `${theme.colors.accentSuccess}08` },
  offlineStatusHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  offlineStatusIconWell: { width: 42, height: 42, borderRadius: theme.radii.sm, backgroundColor: `${theme.colors.accentWarm}14`, borderWidth: 1, borderColor: `${theme.colors.accentWarm}33`, alignItems: 'center', justifyContent: 'center' },
  offlineStatusIconWellReady: { backgroundColor: `${theme.colors.accentSuccess}14`, borderColor: `${theme.colors.accentSuccess}33` },
  offlineStatusCopy: { flex: 1 },
  offlineStatusLabel: { fontSize: theme.fontSize.label, color: theme.colors.textSecondary, fontWeight: theme.fontWeight.medium, letterSpacing: 1.5, marginBottom: 2 },
  offlineStatusTitle: { fontSize: theme.fontSize.heading, color: theme.colors.textPrimary, fontWeight: theme.fontWeight.medium },
  offlineStatusMeta: { fontSize: theme.fontSize.caption, color: theme.colors.textSecondary, marginTop: theme.spacing.sm, lineHeight: 18 },
  offlineStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.bgElevated, borderRadius: theme.radii.pill, paddingHorizontal: 8, paddingVertical: 5 },
  offlineStatusBadgeText: { fontSize: theme.fontSize.caption, color: theme.colors.textAccent, fontWeight: theme.fontWeight.medium },
  offlineStatusBadgeTextOffline: { color: theme.colors.accentWarm },

  // Daily Quest — single row
  questCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.md, padding: theme.spacing.md, marginBottom: theme.spacing.xl, borderWidth: 1, borderColor: theme.colors.borderDefault, gap: theme.spacing.md },
  questIconWell: { width: 36, height: 36, borderRadius: theme.radii.sm, backgroundColor: theme.colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  questBody: { flex: 1 },
  questLabel: { fontSize: theme.fontSize.label, fontWeight: theme.fontWeight.medium, color: theme.colors.textSecondary, letterSpacing: 1.5, marginBottom: 2 },
  questTitle: { fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary },
  questFraction: { fontSize: theme.fontSize.caption, fontWeight: theme.fontWeight.medium, color: theme.colors.textSecondary, minWidth: 32, textAlign: 'right' },

  // Daily Review card
  reviewCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.md, padding: theme.spacing.md, borderWidth: 1, borderColor: 'rgba(255, 170, 0, 0.35)', marginBottom: theme.spacing.md, gap: theme.spacing.sm },
  reviewIconWell: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255, 170, 0, 0.1)', alignItems: 'center', justifyContent: 'center' },
  reviewLabel: { fontSize: theme.fontSize.label, fontWeight: theme.fontWeight.medium, color: theme.colors.accentWarm, letterSpacing: 1.2 },
  reviewTitle: { fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, marginTop: 1 },
  reviewBadge: { minWidth: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.accentWarm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  reviewBadgeText: { fontSize: 13, fontWeight: theme.fontWeight.medium, color: '#000' },

  // Path label
  pathLabel: { fontSize: theme.fontSize.label, fontWeight: theme.fontWeight.medium, color: theme.colors.textTertiary, letterSpacing: 1.5, marginBottom: theme.spacing.md, marginTop: theme.spacing.sm },

  // Unit header (restyled)
  unitRow: { marginTop: theme.spacing.xxl, marginBottom: theme.spacing.lg, paddingVertical: theme.spacing.sm },
  unitTitle: { fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.medium, color: theme.colors.textSecondary, letterSpacing: 1.5, textTransform: 'uppercase' },
  unitSubtitle: { marginTop: 6, fontSize: theme.fontSize.body, color: theme.colors.textSecondary, lineHeight: 18 },

  // Lesson rows
  lessonRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.md, paddingVertical: 18, paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.borderDefault, gap: theme.spacing.md },
  lessonRowActive: { borderColor: theme.colors.borderAccent },
  lessonRowLocked: { opacity: 0.75 },
  lessonRowPremium: { opacity: 1, borderColor: '#F59E0B44', backgroundColor: '#F59E0B06' },
  lessonIconWell: { width: 40, height: 40, borderRadius: theme.radii.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.borderDefault, backgroundColor: 'transparent' },
  lessonIconWellActive: { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.borderAccent },
  lessonIconWellPremium: { borderColor: '#F59E0B44', backgroundColor: '#F59E0B12' },
  lessonMiddle: { flex: 1 },
  lessonLabel: { fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, marginBottom: 2 },
  lessonMeta: { fontSize: 12, color: theme.colors.textSecondary },
  lessonMetaActive: { color: theme.colors.textAccent },
  lessonConnector: { width: 2, height: 10, backgroundColor: theme.colors.borderDefault, marginLeft: 36, marginBottom: theme.spacing.sm, borderRadius: 1 },
  lessonConnectorDone: { backgroundColor: theme.colors.accentPrimary },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F59E0B18', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: '#F59E0B33' },
  premiumBadgeText: { fontSize: 10, fontWeight: '700', color: '#F59E0B' },
  // Quiz button
  quizButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.bgSurface, borderWidth: 1, borderColor: theme.colors.borderAccent, borderRadius: theme.radii.md, padding: theme.spacing.lg, gap: theme.spacing.md, marginBottom: theme.spacing.sm },
  quizButtonLocked: { borderColor: theme.colors.borderDefault, opacity: 0.55 },
  quizButtonDone: { borderColor: theme.colors.accentSuccess },
  quizButtonIcon: { width: 28, alignItems: 'center', justifyContent: 'center' },
  quizButtonTitle: { fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary },
  quizButtonSub: { fontSize: theme.fontSize.caption, color: theme.colors.textSecondary, marginTop: 2 },
});
