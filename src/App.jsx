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
import EstatisticasTab from './components/tabs/EstatisticasTab';

const MIN_JOGADORES_LINHA = 15;
const LIMIAR_QUATRO_TIMES = 15;
const ADMIN_KEYS = ['gustavo', 'miguel', 'enzo'];
const VIEWER_KEY = 'visualização';
const DRAFT_JITTER = 0.6;
const DRAFT_CANDIDATES = 60;
const REPEAT_MATCH_WEIGHTS = [3, 1]; // peso do jogo anterior, depois do jogo anterior a esse
const MAX_ACTIVITY_LOG = 150;
const LAST_SEEN_ACTIVITY_KEY = 'fc_last_seen_activity_ts';

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
  const [matchPendingDelete, setMatchPendingDelete] = useState(null);
  const [draftNotice, setDraftNotice] = useState(null);
  const seenDraftEventId = useRef(null);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [lastSeenActivityTs, setLastSeenActivityTs] = useState(() => Number(localStorage.getItem(LAST_SEEN_ACTIVITY_KEY)) || 0);
  const hasUnreadActivity = activityLog.some((entry) => entry.timestamp > lastSeenActivityTs);

  const [activeTab, setActiveTab] = useState('times');
  const [currentAdmin, setCurrentAdmin] = useState(null);
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
  const [tempNotes, setTempNotes] = useState({ gustavo: 7.0, enzo: 7.0, miguel: 7.0 });
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
    if (ADMIN_KEYS.includes(key) || key === VIEWER_KEY) {
      setCurrentAdmin(key);
      setShowAdminModal(false);
      setPasswordInput('');
      setAdminError('');
    } else {
      setAdminError('Senha incorreta!');
    }
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
      notaEnzo: 7.0,
      notaGustavo: 7.0,
      notaMiguel: 7.0,
      notaMedia: 7.0,
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
      ...(posicaoFixa === 'Linha' && { notaEnzo: 7.0, notaGustavo: 7.0, notaMiguel: 7.0, notaMedia: 7.0 }),
    };

    setPlayers([...players, newPlayer]);
    setShowAddPlayerModal(false);
    triggerAlert(`${newPlayer.nome} adicionado!`, 'success');
    logActivity(`adicionou ${newPlayer.nome} (${category})`);
  };

  const handleEditPlayer = ({ nome, foto }) => {
    if (isViewer || !editPlayerTarget) return;
    setPlayers(players.map((p) => (p.id === editPlayerTarget.id ? { ...p, nome, foto } : p)));
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
      notaEnzo: 7.0,
      notaGustavo: 7.0,
      notaMiguel: 7.0,
      notaMedia: 7.0,
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
      winners: [],
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

  const handleToggleMatchWinner = (matchId, teamId) => {
    if (!isAdmin || isViewer) return;
    const match = matchHistory.find((m) => m.id === matchId);
    const team = match?.teams.find((t) => t.id === teamId);
    setMatchHistory(matchHistory.map((m) => {
      if (m.id !== matchId) return m;
      const winners = m.winners.includes(teamId) ? m.winners.filter((id) => id !== teamId) : [...m.winners, teamId];
      return { ...m, winners };
    }));
    if (team) logActivity(`marcou/desmarcou ${team.name} como vencedor no histórico`);
  };

  const handleAddGoal = (matchId, playerId, playerNome) => {
    if (!isAdmin || isViewer) return;
    setMatchHistory(matchHistory.map((m) => {
      if (m.id !== matchId) return m;
      const existing = m.goals.find((g) => g.playerId === playerId);
      const goals = existing
        ? m.goals.map((g) => (g.playerId === playerId ? { ...g, gols: g.gols + 1 } : g))
        : [...m.goals, { playerId, nome: playerNome, gols: 1 }];
      return { ...m, goals };
    }));
  };

  const handleRemoveGoal = (matchId, playerId) => {
    if (!isAdmin || isViewer) return;
    setMatchHistory(matchHistory.map((m) => {
      if (m.id !== matchId) return m;
      const goals = m.goals
        .map((g) => (g.playerId === playerId ? { ...g, gols: g.gols - 1 } : g))
        .filter((g) => g.gols > 0);
      return { ...m, goals };
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
    setTempNotes({
      gustavo: player.notaGustavo || 7.0,
      enzo: player.notaEnzo || 7.0,
      miguel: player.notaMiguel || 7.0,
    });
    setShowRatingModal(true);
  };

  const handleSaveRatings = () => {
    if (isViewer || !ratingTargetPlayer) return;

    const notaGustavo = currentAdmin === 'gustavo' ? tempNotes.gustavo : ratingTargetPlayer.notaGustavo ?? 7.0;
    const notaEnzo = currentAdmin === 'enzo' ? tempNotes.enzo : ratingTargetPlayer.notaEnzo ?? 7.0;
    const notaMiguel = currentAdmin === 'miguel' ? tempNotes.miguel : ratingTargetPlayer.notaMiguel ?? 7.0;
    const avg = parseFloat(((notaGustavo + notaEnzo + notaMiguel) / 3).toFixed(2));

    setPlayers(players.map((p) => (p.id === ratingTargetPlayer.id ? { ...p, notaGustavo, notaEnzo, notaMiguel, notaMedia: avg } : p)));

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
  const presentCount = useMemo(() => players.filter((p) => p.statusPresenca).length, [players]);
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
        onView={() => { setActiveTab('times'); setDraftNotice(null); }}
        onDismiss={() => setDraftNotice(null)}
      />

      <Header
        isAdmin={isAdmin}
        currentAdmin={currentAdmin}
        onLogoClick={handleLogoClick}
        onLeaveAdmin={() => { setCurrentAdmin(null); setActiveTab('times'); triggerAlert('Saiu do modo ADM', 'info'); }}
        hasUnreadActivity={hasUnreadActivity}
        onOpenActivityLog={handleOpenActivityLog}
      />

      <main className="flex-1 max-w-md w-full mx-auto px-3.5 py-4">
        {activeTab === 'times' && (
          <TimesTab
            players={players}
            generatedTeams={generatedTeams}
            teamsDrafted={teamsDrafted}
            isAdmin={isAdmin}
            isViewer={isViewer}
            copied={copied}
            onCopyTeams={handleCopyTeamsText}
            onResetTeams={handleResetTeams}
            onGoToHistory={() => setActiveTab('estatisticas')}
          />
        )}

        {activeTab === 'presenca' && isAdmin && (
          <PresencaTab
            players={players}
            isViewer={isViewer}
            linePlayersList={linePlayersList}
            goalkeepersList={goalkeepersList}
            presentCount={presentCount}
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
            isAdmin={isAdmin}
            isViewer={isViewer}
            onRequestDeleteMatch={(matchId) => setMatchPendingDelete(matchId)}
            onUpdateDate={handleUpdateMatchDate}
            onToggleWinner={handleToggleMatchWinner}
            onAddGoal={handleAddGoal}
            onRemoveGoal={handleRemoveGoal}
          />
        )}
      </main>

      <BottomNav isAdmin={isAdmin} activeTab={activeTab} onChangeTab={setActiveTab} />

      {showAdminModal && (
        <AdminModal
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
          activityLog={activityLog}
          onClose={() => setShowActivityLog(false)}
        />
      )}
    </div>
  );
}
