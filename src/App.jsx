import { useState, useRef, useMemo, useEffect } from 'react';
import { JOGADORES_LINHA_INICIAIS, GOLEIROS_INICIAIS } from './data/initialPlayers';
import { useFirestoreField } from './hooks/useFirestoreField';
import Toast from './components/Toast';
import UndoToast from './components/UndoToast';
import Skeleton from './components/Skeleton';
import DraftNotification from './components/DraftNotification';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import SideNav from './components/SideNav';
import TimesTab from './components/tabs/TimesTab';
import PresencaTab from './components/tabs/PresencaTab';
import NotasTab from './components/tabs/NotasTab';
import JogadoresTab from './components/tabs/JogadoresTab';
import AdminModal from './components/modals/AdminModal';
import SearchModal from './components/modals/SearchModal';
import AddAvulsoModal from './components/modals/AddAvulsoModal';
import RatingModal from './components/modals/RatingModal';
import ImportAttendanceModal from './components/modals/ImportAttendanceModal';
import AddPlayerModal from './components/modals/AddPlayerModal';
import EditPlayerModal from './components/modals/EditPlayerModal';
import ConfirmDeleteModal from './components/modals/ConfirmDeleteModal';
import ActivityLogModal from './components/modals/ActivityLogModal';
import SettingsModal from './components/modals/SettingsModal';
import ConfirmActionModal from './components/modals/ConfirmActionModal';
import PullToRefresh from './components/PullToRefresh';
import EstatisticasTab from './components/tabs/EstatisticasTab';
import PlayerProfileModal from './components/modals/PlayerProfileModal';
import { activeRaters, ratingFieldFor, computeNotaMedia, slugifyAdminKey } from './utils/ratings';
import { VIEWER_KEY } from './utils/adminLabels';
import { sha256Hex } from './utils/hash';
import { draftBalancedTeams, orderTeamsByStrength } from './utils/draft';
import { computeBadgesForPlayers } from './utils/badges';

const MIN_JOGADORES_LINHA = 15;
const LIMIAR_QUATRO_TIMES = 15;
// Hashes SHA-256 das senhas padrão ('Gustavo', 'Enzo', 'Miguel').
const DEFAULT_ADMINS = [
  { key: 'gustavo', label: 'Gustavo', passwordHash: 'ec29b76d468efbf702e33789d4bb8aa87239bd8615cbbaa1298f7763b7340f7d', password: 'ec29b76d468efbf702e33789d4bb8aa87239bd8615cbbaa1298f7763b7340f7d', hidden: false },
  { key: 'enzo', label: 'Enzo', passwordHash: '59e7d31e6d5755532a278af14a87dd9ddce3b8f5342a8eb479871a40d8858333', password: '59e7d31e6d5755532a278af14a87dd9ddce3b8f5342a8eb479871a40d8858333', hidden: false },
  { key: 'miguel', label: 'Miguel', passwordHash: '977af1277234b4aad73217ed362c2de7d4b48b518f47e807d860997972663a1f', password: '977af1277234b4aad73217ed362c2de7d4b48b518f47e807d860997972663a1f', hidden: false },
];
const MAX_ACTIVITY_LOG = 150;
const LAST_SEEN_ACTIVITY_KEY = 'fc_last_seen_activity_ts';
const ACTIVITY_WINDOW_MS = 12 * 60 * 60 * 1000;
const ACTIVITY_CANCEL_WINDOW_MS = 60 * 1000;
const ADMIN_SESSION_KEY = 'fc_admin_session';
const MATCH_EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const UNDO_WINDOW_MS = 6000;

function readStoredSession() {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredSession(session) {
  if (session) localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(ADMIN_SESSION_KEY);
}

const bgTextureStyle = {
  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(23,52,48,0.06) 1px, transparent 0)',
  backgroundSize: '20px 20px',
};

export default function App() {
  const [players, setPlayers, isLoadingData] = useFirestoreField('players', [...JOGADORES_LINHA_INICIAIS, ...GOLEIROS_INICIAIS]);
  const [generatedTeams, setGeneratedTeams] = useFirestoreField('generatedTeams', []);
  const [teamsDrafted, setTeamsDrafted] = useFirestoreField('teamsDrafted', false);
  const [matchHistory, setMatchHistory] = useFirestoreField('matchHistory', []);
  const [ratingHistory, setRatingHistory] = useFirestoreField('ratingHistory', []);
  const [lastDraftEvent, setLastDraftEvent] = useFirestoreField('lastDraftEvent', null);
  const [activityLog, setActivityLog] = useFirestoreField('activityLog', []);
  const [admins, setAdmins] = useFirestoreField('admins', DEFAULT_ADMINS);
  const [admPrepActive, setAdmPrepActive] = useFirestoreField('admPrepActive', false);

  const safePlayers = useMemo(() => (Array.isArray(players) ? players : []), [players]);
  const safeGeneratedTeams = useMemo(() => (Array.isArray(generatedTeams) ? generatedTeams : []), [generatedTeams]);
  const safeMatchHistory = useMemo(() => (Array.isArray(matchHistory) ? matchHistory : []), [matchHistory]);
  const safeRatingHistory = useMemo(() => (Array.isArray(ratingHistory) ? ratingHistory : []), [ratingHistory]);
  const safeActivityLog = useMemo(() => (Array.isArray(activityLog) ? activityLog : []), [activityLog]);
  const safeAdmins = useMemo(() => (Array.isArray(admins) ? admins : DEFAULT_ADMINS), [admins]);

  const handleStartNextFut = () => {
    setAdmPrepActive(true);
    triggerAlert('Chamada aberta para montagem dos próximos times!', 'info');
  };

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [adminPendingDelete, setAdminPendingDelete] = useState(null);
  const [matchPendingDelete, setMatchPendingDelete] = useState(null);
  const [draftNotice, setDraftNotice] = useState(null);
  const seenDraftEventId = useRef(null);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [lastSeenActivityTs, setLastSeenActivityTs] = useState(() => Number(localStorage.getItem(LAST_SEEN_ACTIVITY_KEY)) || 0);
  const recentActivityLog = useMemo(
    () => safeActivityLog.filter((entry) => entry && Date.now() - (entry.timestamp || 0) <= ACTIVITY_WINDOW_MS),
    [safeActivityLog]
  );
  const hasUnreadActivity = recentActivityLog.some((entry) => entry && entry.timestamp > lastSeenActivityTs);

  const [activeTab, setActiveTab] = useState('times');
  const [currentAdmin, setCurrentAdmin] = useState(() => readStoredSession()?.key ?? null);
  const isAdmin = currentAdmin !== null;
  const isViewer = currentAdmin === VIEWER_KEY;
  const isRealAdmin = isAdmin && !isViewer;
  const [matchPendingFinalize, setMatchPendingFinalize] = useState(null);

  // Um jogo fica travado pra quem não é ADM 24h após sua finalização (ou criação).
  function isMatchLocked(match) {
    if (!match) return false;
    const refTimeStr = match.finalizadoEm || match.date;
    if (!refTimeStr) return false;
    const matchTime = new Date(refTimeStr).getTime();
    if (isNaN(matchTime)) return false;
    return Date.now() - matchTime > MATCH_EDIT_WINDOW_MS;
  }

  // Gols, assistências e vitórias ficam livres pra qualquer um marcar (ADM ou não),
  // menos pra quem tá no modo visualização, até o jogo travar — daí só ADM edita.
  function canEditMatchStats(match) {
    if (isViewer) return false;
    if (isRealAdmin) return true;
    return !isMatchLocked(match);
  }
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [adminError, setAdminError] = useState('');
  const logoClicksRef = useRef({ count: 0, lastClick: 0 });

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddAvulsoModal, setShowAddAvulsoModal] = useState(false);
  const [newAvulsoName, setNewAvulsoName] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingTargetPlayer, setRatingTargetPlayer] = useState(null);
  const [tempNotes, setTempNotes] = useState({});
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [addPlayerCategory, setAddPlayerCategory] = useState('Mensalista');
  const [editPlayerTarget, setEditPlayerTarget] = useState(null);
  const [systemAlert, setSystemAlert] = useState({ show: false, message: '', type: 'info' });
  const [copied, setCopied] = useState(false);
  const [undoState, setUndoState] = useState(null);
  const [profileTargetPlayer, setProfileTargetPlayer] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallGuideModal, setShowInstallGuideModal] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (err) {
        console.log('Notification permission error:', err);
      }
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        triggerAlert('Aplicativo adicionado à tela de início com sucesso!', 'success');
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallGuideModal(true);
    }
  };

  const badgesByPlayerId = useMemo(
    () => computeBadgesForPlayers(safePlayers, safeMatchHistory, safeRatingHistory),
    [safePlayers, safeMatchHistory, safeRatingHistory]
  );

  const triggerAlert = (message, type = 'info') => {
    setSystemAlert({ show: true, message, type });
    setTimeout(() => {
      setSystemAlert({ show: false, message: '', type: 'info' });
    }, 3000);
  };

  const scheduleUndo = (message, undo) => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoState({ message, undo });
    undoTimerRef.current = setTimeout(() => setUndoState(null), UNDO_WINDOW_MS);
  };

  const handleUndo = () => {
    if (!undoState) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoState.undo();
    setUndoState(null);
  };

  const logActivity = (message, meta = {}) => {
    if (isSimulationMode || !currentAdmin || isViewer) return;
    const { groupKey, delta, ...restMeta } = meta;

    // Se essa ação anula uma ação recente e oposta do mesmo ADM (ex: tirou o time e resetou
    // em seguida, marcou um gol e removeu logo depois), descarta as duas em vez de notificar.
    if (groupKey && delta) {
      const now = Date.now();
      const recentMatches = activityLog.filter(
        (entry) => entry.groupKey === groupKey && entry.adminKey === currentAdmin && now - entry.timestamp <= ACTIVITY_CANCEL_WINDOW_MS
      );
      const pendingDelta = recentMatches.reduce((sum, entry) => sum + (entry.delta || 0), 0) + delta;
      if (pendingDelta === 0 && recentMatches.length > 0) {
        const recentIds = new Set(recentMatches.map((entry) => entry.id));
        setActivityLog(activityLog.filter((entry) => !recentIds.has(entry.id)));
        return;
      }
    }

    const entry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      adminKey: currentAdmin,
      message,
      timestamp: Date.now(),
      ...(groupKey ? { groupKey, delta } : {}),
      ...restMeta,
    };
    setActivityLog([entry, ...activityLog].slice(0, MAX_ACTIVITY_LOG));
  };

  const handleOpenActivityLog = () => {
    setShowActivityLog(true);
    const now = Date.now();
    setLastSeenActivityTs(now);
    localStorage.setItem(LAST_SEEN_ACTIVITY_KEY, String(now));
  };

  useEffect(() => {
    const session = readStoredSession();
    if (!session) return;
    if (session.key === VIEWER_KEY) return;
    const admin = admins.find((a) => a.key === session.key);
    if (!admin) {
      writeStoredSession(null);
      if (currentAdmin === session.key) {
        setCurrentAdmin(null);
        setActiveTab('times');
      }
      return;
    }
    const adminPass = admin.passwordHash || admin.password;
    if (!session.passwordHash || adminPass === session.passwordHash || admin.key === session.key) {
      if (currentAdmin !== admin.key) setCurrentAdmin(admin.key);
    } else {
      writeStoredSession(null);
      if (currentAdmin === session.key) {
        setCurrentAdmin(null);
        setActiveTab('times');
        triggerAlert('Sua senha foi alterada por um ADM. Entre novamente.', 'info');
      }
    }
  }, [admins]);

  useEffect(() => {
    if (!lastDraftEvent) return;
    if (seenDraftEventId.current === null) {
      seenDraftEventId.current = lastDraftEvent.id;
      return;
    }
    if (lastDraftEvent.id === seenDraftEventId.current) return;
    seenDraftEventId.current = lastDraftEvent.id;
    if (lastDraftEvent.adminKey === currentAdmin) return;

    setDraftNotice(lastDraftEvent);
    const timer = setTimeout(() => setDraftNotice(null), 12000);
    return () => clearTimeout(timer);
  }, [lastDraftEvent, currentAdmin]);

  const handleLogoClick = () => {
    const now = Date.now();
    const clicks = logoClicksRef.current;
    if (now - clicks.lastClick < 650) {
      clicks.count += 1;
    } else {
      clicks.count = 1;
    }
    clicks.lastClick = now;

    if (clicks.count === 3) {
      clicks.count = 0;
      if (isAdmin) {
        setCurrentAdmin(null);
        writeStoredSession(null);
        setActiveTab('times');
        triggerAlert('Modo ADM Desativado', 'info');
      } else {
        setShowAdminModal(true);
      }
    }
  };

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    const trimmed = passwordInput.trim();
    if (!trimmed) {
      setAdminError('Senha incorreta!');
      return;
    }
    if (trimmed.toLowerCase() === VIEWER_KEY) {
      setCurrentAdmin(VIEWER_KEY);
      writeStoredSession({ key: VIEWER_KEY });
      setShowAdminModal(false);
      setPasswordInput('');
      setAdminError('');
      return;
    }

    const exactHash = await sha256Hex(trimmed);

    // Strictly case-sensitive: compare exact SHA-256 hash or exact plain-text password ("Gustavo", "Enzo", "Miguel")
    const matchIndex = admins.findIndex((a) => {
      const p = a.passwordHash || a.password;
      if (p && (p === exactHash || p === trimmed)) return true;
      // Plain text match with capitalized label ("Gustavo", "Enzo", "Miguel")
      if (trimmed === a.label) return true;
      return false;
    });

    if (matchIndex !== -1) {
      const match = admins[matchIndex];
      // Automatically upgrade stored format in Firestore to the SHA-256 hash
      if (match.password !== exactHash || match.passwordHash !== exactHash) {
        const nextAdmins = [...admins];
        nextAdmins[matchIndex] = {
          ...match,
          passwordHash: exactHash,
          password: exactHash,
        };
        setAdmins(nextAdmins);
      }
      setCurrentAdmin(match.key);
      writeStoredSession({ key: match.key, passwordHash: exactHash });
      setShowAdminModal(false);
      setPasswordInput('');
      setAdminError('');
    } else {
      setAdminError('Senha incorreta!');
    }
  };

  const buildDefaultRatings = () => {
    const ratings = {};
    activeRaters(admins).forEach((a) => {
      ratings[ratingFieldFor(a.key)] = 7.0;
    });
    ratings.notaMedia = 7.0;
    return ratings;
  };

  const handleAddAdmin = async (label, password) => {
    const key = slugifyAdminKey(label);
    if (!key) return { error: 'Nome inválido.' };
    if (admins.some((a) => a.key === key)) return { error: 'Já existe um ADM com esse nome.' };
    const passwordHash = await sha256Hex(password.trim());
    setAdmins([...admins, { key, label, passwordHash, password: passwordHash, hidden: false }]);
    logActivity(`adicionou ${label} como novo ADM`);
    return {};
  };

  const handleToggleAdminHidden = (key) => {
    const admin = admins.find((a) => a.key === key);
    if (!admin) return;
    setAdmins(admins.map((a) => (a.key === key ? { ...a, hidden: !a.hidden } : a)));
    logActivity(`${admin.hidden ? 'reativou' : 'ocultou'} o ADM ${admin.label}`);
  };

  const handleDeleteAdmin = (key) => {
    setAdminPendingDelete(key);
  };

  const handleConfirmDeleteAdmin = () => {
    const admin = admins.find((a) => a.key === adminPendingDelete);
    if (!admin) return;
    setAdmins(admins.filter((a) => a.key !== adminPendingDelete));
    if (currentAdmin === adminPendingDelete) {
      setCurrentAdmin(null);
      writeStoredSession(null);
      setActiveTab('times');
    }
    logActivity(`excluiu o ADM ${admin.label}`);
    setAdminPendingDelete(null);
  };

  const handleEditAdminPassword = async (key, newPassword) => {
    if (!newPassword.trim()) return { error: 'Digite a nova senha.' };
    const admin = admins.find((a) => a.key === key);
    if (!admin) return { error: 'ADM não encontrado.' };
    const passwordHash = await sha256Hex(newPassword.trim());
    setAdmins(admins.map((a) => (a.key === key ? { ...a, passwordHash, password: passwordHash } : a)));
    logActivity(`redefiniu a senha do ADM ${admin.label}`);
    if (key === currentAdmin) writeStoredSession({ key, passwordHash });
    triggerAlert(`Senha de ${admin.label} atualizada!`, 'success');
    return {};
  };

  const handleTogglePresence = (playerId) => {
    if (isViewer) return;
    setPlayers(players.map((p) => (p.id === playerId ? { ...p, statusPresenca: !p.statusPresenca } : p)));
  };

  const handleToggleAllInPosition = (posicaoFixa, selectAll) => {
    if (isViewer) return;
    setPlayers(players.map((p) => (p.posicaoFixa === posicaoFixa ? { ...p, statusPresenca: selectAll } : p)));
  };

  const handleToggleTipo = (playerId) => {
    if (isViewer) return;
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    const novoTipo = player.tipo === 'Mensalista' ? 'Avulso' : 'Mensalista';
    setPlayers(players.map((p) => (p.id === playerId ? { ...p, tipo: novoTipo } : p)));
    triggerAlert(`${player.nome} agora é ${novoTipo}`, 'info');
    logActivity(`mudou ${player.nome} para ${novoTipo}`);
  };

  const handleAddAvulso = (e) => {
    e.preventDefault();
    if (isViewer) return;
    if (!newAvulsoName.trim()) return;

    const newPlayer = {
      id: `a-${Date.now()}`,
      nome: newAvulsoName.trim(),
      tipo: 'Avulso',
      posicaoFixa: 'Linha',
      statusPresenca: true,
      ...buildDefaultRatings(),
    };

    setPlayers([...players, newPlayer]);
    setNewAvulsoName('');
    setShowAddAvulsoModal(false);
    triggerAlert(`${newPlayer.nome} adicionado!`, 'success');
    logActivity(`adicionou ${newPlayer.nome} como avulso`);
  };

  const handleChangeCategory = (playerId, category) => {
    if (isViewer) return;
    const player = players.find((p) => p.id === playerId);
    setPlayers(players.map((p) => {
      if (p.id !== playerId) return p;
      if (category === 'Goleiro') return { ...p, posicaoFixa: 'Goleiro' };
      const ratings = p.posicaoFixa === 'Goleiro' && p.notaMedia === undefined ? buildDefaultRatings() : {};
      if (category === 'Avulso') return { ...p, ...ratings, posicaoFixa: 'Linha', tipo: 'Avulso' };
      return { ...p, ...ratings, posicaoFixa: 'Linha', tipo: 'Mensalista' };
    }));
    if (player) logActivity(`moveu ${player.nome} para ${category}`);
  };

  const handleDeletePlayer = (playerId) => {
    if (isViewer) return;
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    if (!window.confirm(`Excluir ${player.nome} definitivamente?`)) return;
    const snapshot = players;
    setPlayers(players.filter((p) => p.id !== playerId));
    logActivity(`excluiu ${player.nome}`);
    scheduleUndo(`${player.nome} excluído`, () => {
      setPlayers(snapshot);
      logActivity(`desfez a exclusão de ${player.nome}`);
    });
  };

  const handleAddPlayer = (nome, category) => {
    if (isViewer) return;
    if (!nome.trim()) return;

    const posicaoFixa = category === 'Goleiro' ? 'Goleiro' : 'Linha';
    const tipo = category === 'Avulso' ? 'Avulso' : 'Mensalista';

    const newPlayer = {
      id: `p-${Date.now()}`,
      nome: nome.trim(),
      tipo,
      posicaoFixa,
      statusPresenca: false,
      ...(posicaoFixa === 'Linha' && buildDefaultRatings()),
    };

    setPlayers([...players, newPlayer]);
    setShowAddPlayerModal(false);
    triggerAlert(`${newPlayer.nome} adicionado!`, 'success');
    logActivity(`adicionou ${newPlayer.nome} (${category})`);
  };

  const handleEditPlayer = ({ nome, foto, fotoJogo }) => {
    if (isViewer || !editPlayerTarget) return;
    setPlayers(players.map((p) => (p.id === editPlayerTarget.id ? { ...p, nome, foto, fotoJogo } : p)));
    setEditPlayerTarget(null);
    triggerAlert('Jogador atualizado!', 'success');
    logActivity(`editou o perfil de ${nome}`);
  };

  const handleApplyImport = (matchedUpdates, avulsosToAdd, goleirosToAdd = []) => {
    if (isViewer) return;
    const updated = players.map((p) => {
      const update = matchedUpdates.find((m) => m.playerId === p.id);
      return update ? { ...p, statusPresenca: update.present } : p;
    });

    const newAvulsos = avulsosToAdd.map((a, idx) => ({
      id: `a-${Date.now()}-${idx}`,
      nome: a.nome,
      tipo: 'Avulso',
      posicaoFixa: 'Linha',
      statusPresenca: a.present,
      ...buildDefaultRatings(),
    }));

    const newGoleiros = goleirosToAdd.map((g, idx) => ({
      id: `g-${Date.now()}-${idx}`,
      nome: g.nome,
      tipo: 'Mensalista',
      posicaoFixa: 'Goleiro',
      statusPresenca: g.present,
    }));

    setPlayers([...updated, ...newAvulsos, ...newGoleiros]);
    setShowImportModal(false);
    triggerAlert(
      `Lista aplicada! ${matchedUpdates.length} atualizado(s), ${newAvulsos.length} avulso(s) e ${newGoleiros.length} goleiro(s) criado(s).`,
      'success'
    );
    logActivity(`importou a lista de presença (${matchedUpdates.length} atualizado(s), ${newAvulsos.length} avulso(s), ${newGoleiros.length} goleiro(s))`);
  };

  const handleDraftTeams = () => {
    if (!isAdmin || isViewer) return;
    const linePresent = players.filter((p) => p.statusPresenca && p.posicaoFixa === 'Linha');

    if (linePresent.length < MIN_JOGADORES_LINHA) {
      triggerAlert(`É preciso ter ${MIN_JOGADORES_LINHA} de linha presentes! Atualmente tem ${linePresent.length}.`, 'error');
      return;
    }

    const numTimes = linePresent.length > LIMIAR_QUATRO_TIMES ? 4 : 3;
    const teams = orderTeamsByStrength(draftBalancedTeams(linePresent, numTimes, matchHistory));

    const historyRecord = {
      id: `m-${Date.now()}`,
      date: new Date().toISOString(),
      teams: teams.map((t) => ({
        id: t.id,
        name: t.name,
        ratingSum: t.ratingSum,
        players: t.players.map((p) => ({ id: p.id, nome: p.nome })),
      })),
      goals: [],
      finalizado: false,
    };

    setGeneratedTeams(teams);
    setTeamsDrafted(true);
    setAdmPrepActive(false);
    setMatchHistory([historyRecord, ...matchHistory]);
    setLastDraftEvent({ id: historyRecord.id, adminKey: currentAdmin, timestamp: Date.now() });
    triggerAlert('Time tirado com sucesso!', 'success');
    logActivity('tirou os times', { groupKey: 'teams-draft', delta: 1 });
    setActiveTab('times');
  };

  const handleResetTeams = () => {
    if (isViewer) return;
    setTeamsDrafted(false);
    setGeneratedTeams([]);
    setAdmPrepActive(true);
    triggerAlert('Chamada liberada!', 'info');
    logActivity('resetou os times (nova chamada)', { groupKey: 'teams-draft', delta: -1 });
    setActiveTab('times');
  };

  const handleUpdateMatchDate = (matchId, newDate) => {
    if (!isAdmin || isViewer) return;
    setMatchHistory(matchHistory.map((m) => (m.id === matchId ? { ...m, date: new Date(newDate).toISOString() } : m)));
    logActivity('alterou a data de um sorteio no histórico');
  };

  const handleFinalizeMatch = (matchId) => {
    if (!isRealAdmin) return;
    setMatchHistory(matchHistory.map((m) => (m.id === matchId ? { ...m, finalizado: true, finalizadoEm: new Date().toISOString() } : m)));
    setMatchPendingFinalize(null);
    setTeamsDrafted(false);
    setGeneratedTeams([]);
    setAdmPrepActive(false);
    triggerAlert('Jogo finalizado! A edição de estatísticas fica aberta por 24h.', 'success');
    logActivity('finalizou o jogo atual');
  };

  const handleAddGoal = (matchId, playerId, playerNome) => {
    const match = matchHistory.find((m) => m.id === matchId);
    if (!canEditMatchStats(match)) return;
    setMatchHistory(matchHistory.map((m) => {
      if (m.id !== matchId) return m;
      const existing = m.goals.find((g) => g.playerId === playerId);
      const goals = existing
        ? m.goals.map((g) => (g.playerId === playerId ? { ...g, gols: (g.gols || 0) + 1 } : g))
        : [...m.goals, { playerId, nome: playerNome, gols: 1, assistencias: 0 }];
      return { ...m, goals };
    }));
    logActivity(`marcou um gol de ${playerNome}`, { groupKey: `goal-${matchId}-${playerId}`, delta: 1 });
  };

  const handleRemoveGoal = (matchId, playerId, playerNome) => {
    const match = matchHistory.find((m) => m.id === matchId);
    if (!canEditMatchStats(match)) return;
    setMatchHistory(matchHistory.map((m) => {
      if (m.id !== matchId) return m;
      const goals = m.goals
        .map((g) => (g.playerId === playerId ? { ...g, gols: (g.gols || 0) - 1 } : g))
        .filter((g) => (g.gols || 0) > 0 || (g.assistencias || 0) > 0);
      return { ...m, goals };
    }));
    logActivity(`removeu um gol de ${playerNome}`, { groupKey: `goal-${matchId}-${playerId}`, delta: -1 });
  };

  const handleAddAssist = (matchId, playerId, playerNome) => {
    const match = matchHistory.find((m) => m.id === matchId);
    if (!canEditMatchStats(match)) return;
    setMatchHistory(matchHistory.map((m) => {
      if (m.id !== matchId) return m;
      const existing = m.goals.find((g) => g.playerId === playerId);
      const goals = existing
        ? m.goals.map((g) => (g.playerId === playerId ? { ...g, assistencias: (g.assistencias || 0) + 1 } : g))
        : [...m.goals, { playerId, nome: playerNome, gols: 0, assistencias: 1 }];
      return { ...m, goals };
    }));
    logActivity(`marcou uma assistência de ${playerNome}`, { groupKey: `assist-${matchId}-${playerId}`, delta: 1 });
  };

  const handleRemoveAssist = (matchId, playerId, playerNome) => {
    const match = matchHistory.find((m) => m.id === matchId);
    if (!canEditMatchStats(match)) return;
    setMatchHistory(matchHistory.map((m) => {
      if (m.id !== matchId) return m;
      const goals = m.goals
        .map((g) => (g.playerId === playerId ? { ...g, assistencias: (g.assistencias || 0) - 1 } : g))
        .filter((g) => (g.gols || 0) > 0 || (g.assistencias || 0) > 0);
      return { ...m, goals };
    }));
    logActivity(`removeu uma assistência de ${playerNome}`, { groupKey: `assist-${matchId}-${playerId}`, delta: -1 });
  };

  function resultCount(match, teamId, type) {
    const team = match.teams.find((t) => t.id === teamId);
    if (!team) return 0;
    if (typeof team[type] === 'number') return team[type];
    if (type === 'vitorias' && match.winners?.includes(teamId)) return 1;
    return 0;
  }

  const handleAddResult = (matchId, teamId, type) => {
    const match = matchHistory.find((m) => m.id === matchId);
    if (!match || !canEditMatchStats(match)) return;
    const nextValue = resultCount(match, teamId, type) + 1;
    setMatchHistory(matchHistory.map((m) => {
      if (m.id !== matchId) return m;
      return { ...m, teams: m.teams.map((t) => (t.id === teamId ? { ...t, [type]: nextValue } : t)) };
    }));
    const team = match.teams.find((t) => t.id === teamId);
    if (team) {
      logActivity(`marcou ${type === 'vitorias' ? 'uma vitória' : 'um empate'} pro ${team.name}`, {
        groupKey: `result-${matchId}-${teamId}-${type}`,
        delta: 1,
      });
    }
  };

  const handleRemoveResult = (matchId, teamId, type) => {
    const match = matchHistory.find((m) => m.id === matchId);
    if (!match || !canEditMatchStats(match)) return;
    const nextValue = Math.max(0, resultCount(match, teamId, type) - 1);
    setMatchHistory(matchHistory.map((m) => {
      if (m.id !== matchId) return m;
      return { ...m, teams: m.teams.map((t) => (t.id === teamId ? { ...t, [type]: nextValue } : t)) };
    }));
    const team = match.teams.find((t) => t.id === teamId);
    if (team) {
      logActivity(`removeu ${type === 'vitorias' ? 'uma vitória' : 'um empate'} pro ${team.name}`, {
        groupKey: `result-${matchId}-${teamId}-${type}`,
        delta: -1,
      });
    }
  };

  const handleDeleteMatch = (matchId) => {
    if (!isAdmin || isViewer) return;
    const snapshot = matchHistory;
    const isCurrent = matchHistory[0]?.id === matchId;
    setMatchHistory(matchHistory.filter((m) => m.id !== matchId));
    if (isCurrent && teamsDrafted) {
      setTeamsDrafted(false);
      setGeneratedTeams([]);
    }
    setMatchPendingDelete(null);
    logActivity('excluiu um sorteio do histórico');
    scheduleUndo('Sorteio excluído do histórico', () => {
      setMatchHistory(snapshot);
      if (isCurrent) {
        const match = snapshot.find((m) => m.id === matchId);
        if (match && match.teams) {
          setGeneratedTeams(match.teams);
          setTeamsDrafted(true);
        }
      }
      logActivity('desfez a exclusão de um sorteio');
    });
  };

  const handleCopyTeamsText = () => {
    if (!teamsDrafted || generatedTeams.length === 0) return;

    let text = '⚽ FUT CEFAS - TIMES ESCALADOS ⚽\n\n';

    generatedTeams.forEach((t) => {
      text += `${t.name}\n`;
      t.players.forEach((p) => {
        text += `- ${p.nome}\n`;
      });
      text += '\n';
    });

    const goleirosPresentes = players.filter((p) => p.statusPresenca && p.posicaoFixa === 'Goleiro');
    if (goleirosPresentes.length > 0) {
      text += '🧤 GOLEIROS\n';
      goleirosPresentes.forEach((g) => {
        text += `- ${g.nome}\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    triggerAlert('Copiado para a área de transferência!', 'success');
  };

  const handleOpenRatingModal = (player) => {
    setRatingTargetPlayer(player);
    const notes = {};
    activeRaters(admins).forEach((a) => {
      notes[a.key] = player[ratingFieldFor(a.key)] ?? null;
    });
    setTempNotes(notes);
    setShowRatingModal(true);
  };

  const handleSaveRatings = () => {
    if (isViewer || !ratingTargetPlayer) return;

    const updates = {};
    activeRaters(admins).forEach((a) => {
      const field = ratingFieldFor(a.key);
      updates[field] = a.key === currentAdmin ? tempNotes[a.key] : ratingTargetPlayer[field] ?? null;
    });

    const avg = computeNotaMedia({ ...ratingTargetPlayer, ...updates }, admins);

    setPlayers(players.map((p) => (p.id === ratingTargetPlayer.id ? { ...p, ...updates, notaMedia: avg } : p)));
    setRatingHistory([
      ...ratingHistory,
      { playerId: ratingTargetPlayer.id, nome: ratingTargetPlayer.nome, notaMedia: avg, date: new Date().toISOString() },
    ].slice(-3000));

    setShowRatingModal(false);
    setRatingTargetPlayer(null);
    triggerAlert('Nota atualizada!', 'success');
    logActivity(`avaliou ${ratingTargetPlayer.nome} (nova média ${avg})`, { type: 'rating', targetNome: ratingTargetPlayer.nome });
  };

  const handleDragStart = (e, player) => {
    e.dataTransfer.setData('text/plain', player.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetPos) => {
    e.preventDefault();
    if (isViewer) return;
    const playerId = e.dataTransfer.getData('text/plain');
    if (!playerId) return;

    setPlayers(players.map((p) => (p.id === playerId ? { ...p, posicaoFixa: targetPos } : p)));
  };

  const linePlayersList = useMemo(() => safePlayers.filter((p) => p.posicaoFixa === 'Linha'), [safePlayers]);
  const goalkeepersList = useMemo(() => safePlayers.filter((p) => p.posicaoFixa === 'Goleiro'), [safePlayers]);
  const allLinePresent = linePlayersList.length > 0 && linePlayersList.every((p) => p.statusPresenca);
  const allGoalkeepersPresent = goalkeepersList.length > 0 && goalkeepersList.every((p) => p.statusPresenca);

  const filteredSearchList = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return safePlayers.filter((p) => p.nome.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [safePlayers, searchQuery]);



  return (
    <PullToRefresh>
      <div className="min-h-screen flex flex-col font-sans text-fc-ink bg-fc-surface relative" style={bgTextureStyle}>
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="fc-blob absolute top-24 -left-16 w-72 h-72 bg-fc-limesoft/30 rounded-full blur-3xl" />
        <div className="fc-blob absolute top-1/3 -right-20 w-80 h-80 bg-fc-lime/20 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
        <div className="fc-blob absolute bottom-0 left-6 w-64 h-64 bg-fc-coral/10 rounded-full blur-3xl" style={{ animationDelay: '4s' }} />
      </div>

      <Toast alert={systemAlert} />
      <UndoToast state={undoState} onUndo={handleUndo} />
      <DraftNotification
        notice={draftNotice}
        admins={safeAdmins}
        onView={() => { setActiveTab('times'); setDraftNotice(null); }}
        onDismiss={() => setDraftNotice(null)}
      />

      <Header
        isAdmin={isAdmin}
        currentAdmin={currentAdmin}
        admins={safeAdmins}
        onLogoClick={handleLogoClick}
        onLeaveAdmin={() => { setCurrentAdmin(null); writeStoredSession(null); setActiveTab('times'); triggerAlert('Saiu do modo ADM', 'info'); }}
        hasUnreadActivity={hasUnreadActivity}
        onOpenActivityLog={handleOpenActivityLog}
        onOpenSettings={() => setShowSettingsModal(true)}
        canInstallPwa={!isStandalone}
        onInstallApp={handleInstallApp}
      />

      <div className="flex-1 flex md:flex-row md:items-start md:gap-6 md:max-w-6xl md:w-full md:mx-auto md:px-6 md:py-6">
      <SideNav isAdmin={isAdmin} activeTab={activeTab} onChangeTab={setActiveTab} />
      <div className="hidden md:block w-px self-stretch bg-fc-line/50 shrink-0" />
      <main className="flex-1 min-w-0 max-w-md w-full mx-auto px-3.5 pt-3 pb-28 md:max-w-none md:mx-0 md:px-0 md:py-0">
        {isLoadingData ? (
          <Skeleton />
        ) : (
          <>
        {activeTab === 'times' && (() => {
          const latestMatch = safeMatchHistory[0];
          const isLatestMatchFinalized = latestMatch?.finalizado === true;
          const shouldShowSummaryDash =
            !teamsDrafted &&
            isLatestMatchFinalized &&
            !(isAdmin && !isViewer && admPrepActive);

          return (
            <TimesTab
              players={safePlayers}
              generatedTeams={safeGeneratedTeams}
              teamsDrafted={teamsDrafted}
              currentMatch={teamsDrafted ? safeMatchHistory[0] : null}
              isAdmin={isAdmin}
              isViewer={isViewer}
              isRealAdmin={isRealAdmin}
              canEditStats={canEditMatchStats(teamsDrafted ? safeMatchHistory[0] : null)}
              matchLocked={isMatchLocked(teamsDrafted ? safeMatchHistory[0] : null)}
              copied={copied}
              showSummaryDash={shouldShowSummaryDash}
              summaryMatch={latestMatch}
              onStartNextFut={handleStartNextFut}
              onCopyTeams={handleCopyTeamsText}
              onResetTeams={handleResetTeams}
              onGoToHistory={() => setActiveTab('estatisticas')}
              onAddGoal={handleAddGoal}
              onRemoveGoal={handleRemoveGoal}
              onAddAssist={handleAddAssist}
              onRemoveAssist={handleRemoveAssist}
              onAddResult={handleAddResult}
              onRemoveResult={handleRemoveResult}
              onRequestFinalize={() => safeMatchHistory[0] && setMatchPendingFinalize(safeMatchHistory[0].id)}
              badgesByPlayerId={badgesByPlayerId}
              presencaProps={{
                players: safePlayers,
                isViewer,
                linePlayersList,
                goalkeepersList,
                badgesByPlayerId,
                requiredCount: MIN_JOGADORES_LINHA,
                allLinePresent,
                allGoalkeepersPresent,
                onTogglePresence: handleTogglePresence,
                onToggleTipo: handleToggleTipo,
                onToggleAllLine: () => handleToggleAllInPosition('Linha', !allLinePresent),
                onToggleAllGoalkeepers: () => handleToggleAllInPosition('Goleiro', !allGoalkeepersPresent),
                onDragStart: handleDragStart,
                onDragOver: handleDragOver,
                onDrop: handleDrop,
                onOpenSearch: () => setShowSearchModal(true),
                onOpenAddAvulso: () => setShowAddAvulsoModal(true),
                onOpenImport: () => setShowImportModal(true),
                onDraftTeams: handleDraftTeams,
              }}
            />
          );
        })()}

        {activeTab === 'jogadores' && (
          <JogadoresTab
            players={safePlayers}
            matchHistory={safeMatchHistory}
            badgesByPlayerId={badgesByPlayerId}
            onOpenProfile={setProfileTargetPlayer}
          />
        )}

        {activeTab === 'notas' && isAdmin && (
          <NotasTab
            players={safePlayers}
            admins={safeAdmins}
            isViewer={isViewer}
            badgesByPlayerId={badgesByPlayerId}
            onOpenProfile={setProfileTargetPlayer}
            onOpenRatingModal={handleOpenRatingModal}
            onChangeCategory={handleChangeCategory}
            onDeletePlayer={handleDeletePlayer}
            onOpenAddPlayer={(category) => { setAddPlayerCategory(category); setShowAddPlayerModal(true); }}
            onOpenEditPlayer={(player) => setEditPlayerTarget(player)}
          />
        )}

        {activeTab === 'estatisticas' && (
          <EstatisticasTab
            matchHistory={safeMatchHistory}
            players={safePlayers}
            isAdmin={isAdmin}
            isViewer={isViewer}
            canEditStats={canEditMatchStats}
            onRequestDeleteMatch={(matchId) => setMatchPendingDelete(matchId)}
            onUpdateDate={handleUpdateMatchDate}
            onAddResult={handleAddResult}
            onRemoveResult={handleRemoveResult}
            onAddGoal={handleAddGoal}
            onRemoveGoal={handleRemoveGoal}
            onAddAssist={handleAddAssist}
            onRemoveAssist={handleRemoveAssist}
          />
        )}
          </>
        )}
      </main>
      </div>

      <BottomNav isAdmin={isAdmin} activeTab={activeTab} onChangeTab={setActiveTab} />

      {showAdminModal && (
        <AdminModal
          admins={admins}
          passwordInput={passwordInput}
          setPasswordInput={setPasswordInput}
          adminError={adminError}
          onSubmit={handleAdminAuth}
          onClose={() => { setShowAdminModal(false); setPasswordInput(''); setAdminError(''); }}
        />
      )}

      {showSearchModal && (
        <SearchModal
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredList={filteredSearchList}
          badgesByPlayerId={badgesByPlayerId}
          onSelectPlayer={(id) => { handleTogglePresence(id); setShowSearchModal(false); setSearchQuery(''); }}
          onClose={() => { setShowSearchModal(false); setSearchQuery(''); }}
        />
      )}

      {showAddAvulsoModal && (
        <AddAvulsoModal
          newAvulsoName={newAvulsoName}
          setNewAvulsoName={setNewAvulsoName}
          onSubmit={handleAddAvulso}
          onClose={() => { setShowAddAvulsoModal(false); setNewAvulsoName(''); }}
        />
      )}

      {showImportModal && (
        <ImportAttendanceModal
          players={effectivePlayers}
          onApply={handleApplyImport}
          onClose={() => setShowImportModal(false)}
        />
      )}

      {showRatingModal && ratingTargetPlayer && (
        <RatingModal
          player={ratingTargetPlayer}
          admins={activeRaters(admins)}
          tempNotes={tempNotes}
          setTempNotes={setTempNotes}
          currentAdmin={currentAdmin}
          onSave={handleSaveRatings}
          onClose={() => { setShowRatingModal(false); setRatingTargetPlayer(null); }}
        />
      )}

      {showAddPlayerModal && (
        <AddPlayerModal
          defaultCategory={addPlayerCategory}
          onSubmit={handleAddPlayer}
          onClose={() => setShowAddPlayerModal(false)}
        />
      )}

      {editPlayerTarget && (
        <EditPlayerModal
          player={editPlayerTarget}
          onSave={handleEditPlayer}
          onClose={() => setEditPlayerTarget(null)}
        />
      )}

      {matchPendingDelete && (
        <ConfirmDeleteModal
          title="Excluir Sorteio"
          message="Isso remove esse sorteio e o resultado registrado do histórico pra sempre."
          onConfirm={() => handleDeleteMatch(matchPendingDelete)}
          onClose={() => setMatchPendingDelete(null)}
        />
      )}

      {showActivityLog && (
        <ActivityLogModal
          activityLog={recentActivityLog}
          admins={admins}
          onClose={() => setShowActivityLog(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          admins={admins}
          onAddAdmin={handleAddAdmin}
          onToggleHidden={handleToggleAdminHidden}
          onDeleteAdmin={handleDeleteAdmin}
          onEditPassword={handleEditAdminPassword}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {adminPendingDelete && (
        <ConfirmDeleteModal
          title="Excluir ADM"
          message="Isso remove o acesso desse ADM pra sempre. Ele não vai mais conseguir entrar com a senha dele."
          onConfirm={handleConfirmDeleteAdmin}
          onClose={() => setAdminPendingDelete(null)}
        />
      )}

      {profileTargetPlayer && (
        <PlayerProfileModal
          player={profileTargetPlayer}
          badges={badgesByPlayerId?.get(profileTargetPlayer.id) || []}
          matchHistory={safeMatchHistory}
          onClose={() => setProfileTargetPlayer(null)}
        />
      )}

      {matchPendingFinalize && (
        <ConfirmActionModal
          title="Finalizar jogo"
          message="Depois de finalizado, as estatísticas de gols, assistências e vitórias ainda podem ser alteradas durante 24h. Tem certeza?"
          confirmLabel="Finalizar jogo"
          icon="lock"
          onConfirm={() => handleFinalizeMatch(matchPendingFinalize)}
          onClose={() => setMatchPendingFinalize(null)}
        />
      )}

      {showInstallGuideModal && (
        <ConfirmActionModal
          title="Instalar App no Celular"
          message={
            <div className="text-left space-y-2.5">
              <p className="text-[12.5px] font-medium text-fc-ink leading-relaxed">
                Adicione o <strong>Fut Cefas</strong> à sua tela inicial para acessar como um aplicativo e receber notificações:
              </p>
              <div className="space-y-2 bg-fc-cream/80 rounded-xl p-3 border border-fc-line/60 text-[11.5px] text-fc-ink">
                <p className="flex items-start gap-2">
                  <span className="font-bold text-fc-coral shrink-0">📱 iPhone (Safari):</span>
                  <span>Toque no botão <strong>Compartilhar</strong> 📤 e escolha <strong>Adicionar à Tela de Início</strong> ➕.</span>
                </p>
                <p className="flex items-start gap-2 pt-2 border-t border-fc-line/40">
                  <span className="font-bold text-fc-lime shrink-0">🤖 Android (Chrome):</span>
                  <span>Toque nos <strong>3 pontinhos</strong> ⁝ e escolha <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</span>
                </p>
              </div>
            </div>
          }
          confirmLabel="Entendido"
          icon="download"
          onConfirm={() => setShowInstallGuideModal(false)}
          onClose={() => setShowInstallGuideModal(false)}
        />
      )}
      </div>
    </PullToRefresh>
  );
}
