import { useState, useRef, useMemo, useEffect } from 'react';
import { JOGADORES_LINHA_INICIAIS, GOLEIROS_INICIAIS } from './data/initialPlayers';
import { useFirestoreField } from './hooks/useFirestoreField';
import Toast from './components/Toast';
import DraftNotification from './components/DraftNotification';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import TimesTab from './components/tabs/TimesTab';
import PresencaTab from './components/tabs/PresencaTab';
import NotasTab from './components/tabs/NotasTab';
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
import EstatisticasTab from './components/tabs/EstatisticasTab';
import { activeRaters, ratingFieldFor, computeNotaMedia, slugifyAdminKey } from './utils/ratings';
import { VIEWER_KEY } from './utils/adminLabels';

const MIN_JOGADORES_LINHA = 15;
const LIMIAR_QUATRO_TIMES = 15;
const DEFAULT_ADMINS = [
  { key: 'gustavo', label: 'Gustavo', password: 'gustavo', hidden: false },
  { key: 'enzo', label: 'Enzo', password: 'enzo', hidden: false },
  { key: 'miguel', label: 'Miguel', password: 'miguel', hidden: false },
];
const DRAFT_JITTER = 0.6;
const DRAFT_CANDIDATES = 60;
const REPEAT_MATCH_WEIGHTS = [3, 1]; // peso do jogo anterior, depois do jogo anterior a esse
const MAX_ACTIVITY_LOG = 150;
const LAST_SEEN_ACTIVITY_KEY = 'fc_last_seen_activity_ts';
const ACTIVITY_WINDOW_MS = 12 * 60 * 60 * 1000;
const ADMIN_SESSION_KEY = 'fc_admin_session';

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

function pairKey(idA, idB) {
  return idA < idB ? `${idA}|${idB}` : `${idB}|${idA}`;
}

function buildPairWeights(matchHistory) {
  const weights = new Map();
  matchHistory.slice(0, REPEAT_MATCH_WEIGHTS.length).forEach((match, idx) => {
    const weight = REPEAT_MATCH_WEIGHTS[idx];
    match.teams.forEach((team) => {
      const ids = team.players.map((p) => p.id);
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const key = pairKey(ids[i], ids[j]);
          weights.set(key, (weights.get(key) || 0) + weight);
        }
      }
    });
  });
  return weights;
}

function draftOnce(linePresent, numTimes) {
  const withJitter = linePresent.map((p) => ({ player: p, key: p.notaMedia + (Math.random() - 0.5) * DRAFT_JITTER }));
  withJitter.sort((a, b) => b.key - a.key);
  const sorted = withJitter.map((w) => w.player);

  const teams = Array.from({ length: numTimes }, (_, i) => ({
    id: `t${i + 1}`,
    name: `Time ${i + 1}`,
    players: [],
    ratingSum: 0,
  }));

  let ascending = true;
  let teamIdx = 0;

  for (let i = 0; i < sorted.length; i++) {
    const player = sorted[i];
    teams[teamIdx].players.push(player);
    teams[teamIdx].ratingSum += player.notaMedia;

    if (ascending) {
      if (teamIdx === numTimes - 1) ascending = false;
      else teamIdx++;
    } else {
      if (teamIdx === 0) ascending = true;
      else teamIdx--;
    }
  }

  return teams;
}

function scoreDraft(teams, pairWeights) {
  let repeatCost = 0;
  teams.forEach((team) => {
    const ids = team.players.map((p) => p.id);
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        repeatCost += pairWeights.get(pairKey(ids[i], ids[j])) || 0;
      }
    }
  });

  const avgRatings = teams.map((t) => t.ratingSum / t.players.length);
  const mean = avgRatings.reduce((a, b) => a + b, 0) / avgRatings.length;
  const balanceCost = avgRatings.reduce((sum, r) => sum + (r - mean) ** 2, 0);

  // Repeat pairings pesam muito mais que o desbalanço residual, já que o
  // próprio draftOnce já mantém os times parelhos por nível em qualquer ordem.
  return repeatCost * 1000 + balanceCost;
}

function orderTeamsByStrength(teams) {
  const sorted = [...teams].sort((a, b) => a.ratingSum / a.players.length - b.ratingSum / b.players.length);
  return sorted.map((t, i) => ({ ...t, id: `t${i + 1}`, name: `Time ${i + 1}` }));
}

function draftBalancedTeams(linePresent, numTimes, matchHistory) {
  const pairWeights = buildPairWeights(matchHistory);
  let bestTeams = null;
  let bestScore = Infinity;

  for (let i = 0; i < DRAFT_CANDIDATES; i++) {
    const candidate = draftOnce(linePresent, numTimes);
    const score = scoreDraft(candidate, pairWeights);
    if (score < bestScore) {
      bestScore = score;
      bestTeams = candidate;
    }
  }

  return bestTeams;
}

export default function App() {
  const [players, setPlayers] = useFirestoreField('players', [...JOGADORES_LINHA_INICIAIS, ...GOLEIROS_INICIAIS]);
  const [generatedTeams, setGeneratedTeams] = useFirestoreField('generatedTeams', []);
  const [teamsDrafted, setTeamsDrafted] = useFirestoreField('teamsDrafted', false);
  const [matchHistory, setMatchHistory] = useFirestoreField('matchHistory', []);
  const [lastDraftEvent, setLastDraftEvent] = useFirestoreField('lastDraftEvent', null);
  const [activityLog, setActivityLog] = useFirestoreField('activityLog', []);
  const [admins, setAdmins] = useFirestoreField('admins', DEFAULT_ADMINS);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [adminPendingDelete, setAdminPendingDelete] = useState(null);
  const [matchPendingDelete, setMatchPendingDelete] = useState(null);
  const [draftNotice, setDraftNotice] = useState(null);
  const seenDraftEventId = useRef(null);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [lastSeenActivityTs, setLastSeenActivityTs] = useState(() => Number(localStorage.getItem(LAST_SEEN_ACTIVITY_KEY)) || 0);
  const recentActivityLog = useMemo(
    () => activityLog.filter((entry) => Date.now() - entry.timestamp <= ACTIVITY_WINDOW_MS),
    [activityLog]
  );
  const hasUnreadActivity = recentActivityLog.some((entry) => entry.timestamp > lastSeenActivityTs);

  const [activeTab, setActiveTab] = useState('times');
  const [currentAdmin, setCurrentAdmin] = useState(() => readStoredSession()?.key ?? null);
  const isAdmin = currentAdmin !== null;
  const isViewer = currentAdmin === VIEWER_KEY;
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

  const triggerAlert = (message, type = 'info') => {
    setSystemAlert({ show: true, message, type });
    setTimeout(() => {
      setSystemAlert({ show: false, message: '', type: 'info' });
    }, 3000);
  };

  const logActivity = (message) => {
    if (!currentAdmin || isViewer) return;
    const entry = { id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, adminKey: currentAdmin, message, timestamp: Date.now() };
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
    if (admin && admin.password === session.password) {
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

  const handleAdminAuth = (e) => {
    e.preventDefault();
    const key = passwordInput.trim().toLowerCase();
    const match = admins.find((a) => a.password.trim().toLowerCase() === key);
    if (match) {
      setCurrentAdmin(match.key);
      writeStoredSession({ key: match.key, password: match.password });
      setShowAdminModal(false);
      setPasswordInput('');
      setAdminError('');
    } else if (key === VIEWER_KEY) {
      setCurrentAdmin(VIEWER_KEY);
      writeStoredSession({ key: VIEWER_KEY });
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

  const handleAddAdmin = (label, password) => {
    const key = slugifyAdminKey(label);
    if (!key) return { error: 'Nome inválido.' };
    if (admins.some((a) => a.key === key)) return { error: 'Já existe um ADM com esse nome.' };
    setAdmins([...admins, { key, label, password, hidden: false }]);
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

  const handleEditAdminPassword = (key, newPassword) => {
    if (!newPassword.trim()) return { error: 'Digite a nova senha.' };
    const admin = admins.find((a) => a.key === key);
    if (!admin) return { error: 'ADM não encontrado.' };
    const senha = newPassword.trim();
    setAdmins(admins.map((a) => (a.key === key ? { ...a, password: senha } : a)));
    logActivity(`redefiniu a senha do ADM ${admin.label}`);
    if (key === currentAdmin) writeStoredSession({ key, password: senha });
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
      if (category === 'Avulso') return { ...p, posicaoFixa: 'Linha', tipo: 'Avulso' };
      return { ...p, posicaoFixa: 'Linha', tipo: 'Mensalista' };
    }));
    if (player) logActivity(`moveu ${player.nome} para ${category}`);
  };

  const handleDeletePlayer = (playerId) => {
    if (isViewer) return;
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    if (!window.confirm(`Excluir ${player.nome} definitivamente?`)) return;
    setPlayers(players.filter((p) => p.id !== playerId));
    triggerAlert(`${player.nome} excluído.`, 'info');
    logActivity(`excluiu ${player.nome}`);
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

  const handleApplyImport = (matchedUpdates, avulsosToAdd) => {
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

    setPlayers([...updated, ...newAvulsos]);
    setShowImportModal(false);
    triggerAlert(`Lista aplicada! ${matchedUpdates.length} atualizado(s), ${newAvulsos.length} avulso(s) criado(s).`, 'success');
    logActivity(`importou a lista de presença (${matchedUpdates.length} atualizado(s), ${newAvulsos.length} avulso(s))`);
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
    };

    setGeneratedTeams(teams);
    setTeamsDrafted(true);
    setMatchHistory([historyRecord, ...matchHistory]);
    setLastDraftEvent({ id: historyRecord.id, adminKey: currentAdmin, timestamp: Date.now() });
    triggerAlert('Time tirado com sucesso!', 'success');
    logActivity('tirou os times');
    setActiveTab('times');
  };

  const handleResetTeams = () => {
    if (isViewer) return;
    setTeamsDrafted(false);
    setGeneratedTeams([]);
    triggerAlert('Chamada liberada!', 'info');
    logActivity('resetou os times (nova chamada)');
    setActiveTab('presenca');
  };

  const handleUpdateMatchDate = (matchId, newDate) => {
    if (!isAdmin || isViewer) return;
    setMatchHistory(matchHistory.map((m) => (m.id === matchId ? { ...m, date: new Date(newDate).toISOString() } : m)));
    logActivity('alterou a data de um sorteio no histórico');
  };

  const handleAddGoal = (matchId, playerId, playerNome) => {
    if (!isAdmin || isViewer) return;
    setMatchHistory(matchHistory.map((m) => {
      if (m.id !== matchId) return m;
      const existing = m.goals.find((g) => g.playerId === playerId);
      const goals = existing
        ? m.goals.map((g) => (g.playerId === playerId ? { ...g, gols: (g.gols || 0) + 1 } : g))
        : [...m.goals, { playerId, nome: playerNome, gols: 1, assistencias: 0 }];
      return { ...m, goals };
    }));
  };

  const handleRemoveGoal = (matchId, playerId) => {
    if (!isAdmin || isViewer) return;
    setMatchHistory(matchHistory.map((m) => {
      if (m.id !== matchId) return m;
      const goals = m.goals
        .map((g) => (g.playerId === playerId ? { ...g, gols: (g.gols || 0) - 1 } : g))
        .filter((g) => (g.gols || 0) > 0 || (g.assistencias || 0) > 0);
      return { ...m, goals };
    }));
  };

  const handleAddAssist = (matchId, playerId, playerNome) => {
    if (!isAdmin || isViewer) return;
    setMatchHistory(matchHistory.map((m) => {
      if (m.id !== matchId) return m;
      const existing = m.goals.find((g) => g.playerId === playerId);
      const goals = existing
        ? m.goals.map((g) => (g.playerId === playerId ? { ...g, assistencias: (g.assistencias || 0) + 1 } : g))
        : [...m.goals, { playerId, nome: playerNome, gols: 0, assistencias: 1 }];
      return { ...m, goals };
    }));
  };

  const handleRemoveAssist = (matchId, playerId) => {
    if (!isAdmin || isViewer) return;
    setMatchHistory(matchHistory.map((m) => {
      if (m.id !== matchId) return m;
      const goals = m.goals
        .map((g) => (g.playerId === playerId ? { ...g, assistencias: (g.assistencias || 0) - 1 } : g))
        .filter((g) => (g.gols || 0) > 0 || (g.assistencias || 0) > 0);
      return { ...m, goals };
    }));
  };

  function resultCount(match, teamId, type) {
    const team = match.teams.find((t) => t.id === teamId);
    if (!team) return 0;
    if (typeof team[type] === 'number') return team[type];
    if (type === 'vitorias' && match.winners?.includes(teamId)) return 1;
    return 0;
  }

  const handleAddResult = (matchId, teamId, type) => {
    if (!isAdmin || isViewer) return;
    const match = matchHistory.find((m) => m.id === matchId);
    if (!match) return;
    const nextValue = resultCount(match, teamId, type) + 1;
    setMatchHistory(matchHistory.map((m) => {
      if (m.id !== matchId) return m;
      return { ...m, teams: m.teams.map((t) => (t.id === teamId ? { ...t, [type]: nextValue } : t)) };
    }));
    const team = match.teams.find((t) => t.id === teamId);
    if (team) logActivity(`marcou ${type === 'vitorias' ? 'uma vitória' : 'um empate'} pro ${team.name}`);
  };

  const handleRemoveResult = (matchId, teamId, type) => {
    if (!isAdmin || isViewer) return;
    const match = matchHistory.find((m) => m.id === matchId);
    if (!match) return;
    const nextValue = Math.max(0, resultCount(match, teamId, type) - 1);
    setMatchHistory(matchHistory.map((m) => {
      if (m.id !== matchId) return m;
      return { ...m, teams: m.teams.map((t) => (t.id === teamId ? { ...t, [type]: nextValue } : t)) };
    }));
  };

  const handleDeleteMatch = (matchId) => {
    if (!isAdmin || isViewer) return;
    setMatchHistory(matchHistory.filter((m) => m.id !== matchId));
    setMatchPendingDelete(null);
    triggerAlert('Sorteio excluído do histórico.', 'info');
    logActivity('excluiu um sorteio do histórico');
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

    setShowRatingModal(false);
    setRatingTargetPlayer(null);
    triggerAlert('Nota atualizada!', 'success');
    logActivity(`avaliou ${ratingTargetPlayer.nome} (nova média ${avg})`);
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

  const linePlayersList = useMemo(() => players.filter((p) => p.posicaoFixa === 'Linha'), [players]);
  const goalkeepersList = useMemo(() => players.filter((p) => p.posicaoFixa === 'Goleiro'), [players]);
  const allLinePresent = linePlayersList.length > 0 && linePlayersList.every((p) => p.statusPresenca);
  const allGoalkeepersPresent = goalkeepersList.length > 0 && goalkeepersList.every((p) => p.statusPresenca);

  const filteredSearchList = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return players.filter((p) => p.nome.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [players, searchQuery]);

  return (
    <div className="min-h-dvh bg-fc-cream text-fc-dark flex flex-col font-sans select-none pb-28 relative overflow-x-hidden" style={bgTextureStyle}>
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="fc-blob absolute -top-16 -left-16 w-72 h-72 bg-fc-limesoft/40 rounded-full blur-3xl" />
        <div className="fc-blob absolute top-1/3 -right-20 w-80 h-80 bg-fc-lime/20 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
        <div className="fc-blob absolute bottom-0 left-6 w-64 h-64 bg-fc-coral/10 rounded-full blur-3xl" style={{ animationDelay: '4s' }} />
      </div>

      <Toast alert={systemAlert} />
      <DraftNotification
        notice={draftNotice}
        admins={admins}
        onView={() => { setActiveTab('times'); setDraftNotice(null); }}
        onDismiss={() => setDraftNotice(null)}
      />

      <Header
        isAdmin={isAdmin}
        currentAdmin={currentAdmin}
        admins={admins}
        onLogoClick={handleLogoClick}
        onLeaveAdmin={() => { setCurrentAdmin(null); writeStoredSession(null); setActiveTab('times'); triggerAlert('Saiu do modo ADM', 'info'); }}
        hasUnreadActivity={hasUnreadActivity}
        onOpenActivityLog={handleOpenActivityLog}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      <main className="flex-1 max-w-md w-full mx-auto px-3.5 py-4">
        {activeTab === 'times' && (
          <TimesTab
            players={players}
            generatedTeams={generatedTeams}
            teamsDrafted={teamsDrafted}
            currentMatch={teamsDrafted ? matchHistory[0] : null}
            isAdmin={isAdmin}
            isViewer={isViewer}
            copied={copied}
            onCopyTeams={handleCopyTeamsText}
            onResetTeams={handleResetTeams}
            onGoToHistory={() => setActiveTab('estatisticas')}
            onAddGoal={handleAddGoal}
            onRemoveGoal={handleRemoveGoal}
            onAddAssist={handleAddAssist}
            onRemoveAssist={handleRemoveAssist}
            onAddResult={handleAddResult}
            onRemoveResult={handleRemoveResult}
          />
        )}

        {activeTab === 'presenca' && isAdmin && (
          <PresencaTab
            players={players}
            isViewer={isViewer}
            linePlayersList={linePlayersList}
            goalkeepersList={goalkeepersList}
            requiredCount={MIN_JOGADORES_LINHA}
            allLinePresent={allLinePresent}
            allGoalkeepersPresent={allGoalkeepersPresent}
            onTogglePresence={handleTogglePresence}
            onToggleTipo={handleToggleTipo}
            onToggleAllLine={() => handleToggleAllInPosition('Linha', !allLinePresent)}
            onToggleAllGoalkeepers={() => handleToggleAllInPosition('Goleiro', !allGoalkeepersPresent)}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onOpenSearch={() => setShowSearchModal(true)}
            onOpenAddAvulso={() => setShowAddAvulsoModal(true)}
            onOpenImport={() => setShowImportModal(true)}
            onDraftTeams={handleDraftTeams}
          />
        )}

        {activeTab === 'notas' && isAdmin && (
          <NotasTab
            players={players}
            admins={admins}
            isViewer={isViewer}
            onOpenRatingModal={handleOpenRatingModal}
            onChangeCategory={handleChangeCategory}
            onDeletePlayer={handleDeletePlayer}
            onOpenAddPlayer={(category) => { setAddPlayerCategory(category); setShowAddPlayerModal(true); }}
            onOpenEditPlayer={(player) => setEditPlayerTarget(player)}
          />
        )}

        {activeTab === 'estatisticas' && (
          <EstatisticasTab
            matchHistory={matchHistory}
            players={players}
            isAdmin={isAdmin}
            isViewer={isViewer}
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
      </main>

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
          players={players}
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
    </div>
  );
}
