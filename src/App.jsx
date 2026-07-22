import { useState, useRef, useMemo } from 'react';
import { JOGADORES_LINHA_INICIAIS, GOLEIROS_INICIAIS } from './data/initialPlayers';
import { useLocalStorage } from './hooks/useLocalStorage';
import Toast from './components/Toast';
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

const MIN_JOGADORES_LINHA = 15;
const LIMIAR_QUATRO_TIMES = 15;

const bgTextureStyle = {
  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(23,52,48,0.06) 1px, transparent 0)',
  backgroundSize: '20px 20px',
};

export default function App() {
  const [players, setPlayers] = useLocalStorage('fc_players_v7', [...JOGADORES_LINHA_INICIAIS, ...GOLEIROS_INICIAIS]);
  const [generatedTeams, setGeneratedTeams] = useLocalStorage('fc_teams_v7', []);
  const [teamsDrafted, setTeamsDrafted] = useLocalStorage('fc_drafted_v7', false);

  const [activeTab, setActiveTab] = useState('times');
  const [isAdmin, setIsAdmin] = useState(false);
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
  const [systemAlert, setSystemAlert] = useState({ show: false, message: '', type: 'info' });
  const [copied, setCopied] = useState(false);

  const triggerAlert = (message, type = 'info') => {
    setSystemAlert({ show: true, message, type });
    setTimeout(() => {
      setSystemAlert({ show: false, message: '', type: 'info' });
    }, 3000);
  };

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
        setIsAdmin(false);
        setActiveTab('times');
        triggerAlert('Modo ADM Desativado', 'info');
      } else {
        setShowAdminModal(true);
      }
    }
  };

  const handleAdminAuth = (e) => {
    e.preventDefault();
    if (passwordInput.toLowerCase() === 'adminfut') {
      setIsAdmin(true);
      setShowAdminModal(false);
      setPasswordInput('');
      setAdminError('');
    } else {
      setAdminError('Senha incorreta!');
    }
  };

  const handleTogglePresence = (playerId) => {
    setPlayers(players.map((p) => (p.id === playerId ? { ...p, statusPresenca: !p.statusPresenca } : p)));
  };

  const handleToggleAllInPosition = (posicaoFixa, selectAll) => {
    setPlayers(players.map((p) => (p.posicaoFixa === posicaoFixa ? { ...p, statusPresenca: selectAll } : p)));
  };

  const handleToggleTipo = (playerId) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    const novoTipo = player.tipo === 'Mensalista' ? 'Avulso' : 'Mensalista';
    setPlayers(players.map((p) => (p.id === playerId ? { ...p, tipo: novoTipo } : p)));
    triggerAlert(`${player.nome} agora é ${novoTipo}`, 'info');
  };

  const handleAddAvulso = (e) => {
    e.preventDefault();
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
  };

  const handleApplyImport = (matchedUpdates, avulsosToAdd) => {
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
  };

  const handleDraftTeams = () => {
    if (!isAdmin) return;
    const linePresent = players.filter((p) => p.statusPresenca && p.posicaoFixa === 'Linha');

    if (linePresent.length < MIN_JOGADORES_LINHA) {
      triggerAlert(`É preciso ter ${MIN_JOGADORES_LINHA} de linha presentes! Atualmente tem ${linePresent.length}.`, 'error');
      return;
    }

    const numTimes = linePresent.length > LIMIAR_QUATRO_TIMES ? 4 : 3;
    const sorted = [...linePresent].sort((a, b) => b.notaMedia - a.notaMedia);

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

    setGeneratedTeams(teams);
    setTeamsDrafted(true);
    triggerAlert('Time tirado com sucesso!', 'success');
    setActiveTab('times');
  };

  const handleResetTeams = () => {
    setTeamsDrafted(false);
    setGeneratedTeams([]);
    triggerAlert('Chamada liberada!', 'info');
    setActiveTab('presenca');
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
      text += '🧤 GOLEIROS SOLTOS\n';
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
    if (!ratingTargetPlayer) return;
    const avg = parseFloat(((tempNotes.gustavo + tempNotes.enzo + tempNotes.miguel) / 3).toFixed(2));

    setPlayers(players.map((p) => (p.id === ratingTargetPlayer.id ? { ...p, notaGustavo: tempNotes.gustavo, notaEnzo: tempNotes.enzo, notaMiguel: tempNotes.miguel, notaMedia: avg } : p)));

    setShowRatingModal(false);
    setRatingTargetPlayer(null);
    triggerAlert('Nota atualizada!', 'success');
  };

  const handleDragStart = (e, player) => {
    e.dataTransfer.setData('text/plain', player.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetPos) => {
    e.preventDefault();
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
    <div className="min-h-screen bg-fc-cream text-fc-dark flex flex-col font-sans select-none pb-28 relative overflow-x-hidden" style={bgTextureStyle}>
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="fc-blob absolute -top-16 -left-16 w-72 h-72 bg-fc-limesoft/40 rounded-full blur-3xl" />
        <div className="fc-blob absolute top-1/3 -right-20 w-80 h-80 bg-fc-lime/20 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
        <div className="fc-blob absolute bottom-0 left-6 w-64 h-64 bg-fc-coral/10 rounded-full blur-3xl" style={{ animationDelay: '4s' }} />
      </div>

      <Toast alert={systemAlert} />

      <Header isAdmin={isAdmin} onLogoClick={handleLogoClick} onLeaveAdmin={() => { setIsAdmin(false); setActiveTab('times'); triggerAlert('Saiu do modo ADM', 'info'); }} />

      <main className="flex-1 max-w-md w-full mx-auto px-3.5 py-4">
        {activeTab === 'times' && (
          <TimesTab
            players={players}
            generatedTeams={generatedTeams}
            teamsDrafted={teamsDrafted}
            isAdmin={isAdmin}
            copied={copied}
            onCopyTeams={handleCopyTeamsText}
            onResetTeams={handleResetTeams}
          />
        )}

        {activeTab === 'presenca' && isAdmin && (
          <PresencaTab
            players={players}
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

        {activeTab === 'notas' && isAdmin && <NotasTab players={players} onOpenRatingModal={handleOpenRatingModal} />}
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
          onSave={handleSaveRatings}
          onClose={() => { setShowRatingModal(false); setRatingTargetPlayer(null); }}
        />
      )}
    </div>
  );
}
