import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, doc, onSnapshot, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// --- JOGADORES REAIS DO CLIENTE (18 LINHA + 6 GOLEIROS) ---
const MENSALISTAS_DADOS = [
  // Linha
  { id: 'm1', nome: 'Chicon', tipo: 'Mensalista', posicaoFixa: 'Linha', statusPresenca: true, notaGustavo: 7.5, notaEnzo: 6.5, notaMiguel: 6.0, notaMedia: 6.67 },
  { id: 'm2', nome: 'Miguel', tipo: 'Mensalista', posicaoFixa: 'Linha', statusPresenca: true, notaGustavo: 8.5, notaEnzo: 8.0, notaMiguel: 8.0, notaMedia: 8.17 },
  { id: 'm3', nome: 'Joãozinho', tipo: 'Mensalista', posicaoFixa: 'Linha', statusPresenca: true, notaGustavo: 9.0, notaEnzo: 9.0, notaMiguel: 9.0, notaMedia: 9.0 },
  { id: 'm4', nome: 'Pig', tipo: 'Mensalista', posicaoFixa: 'Linha', statusPresenca: true, notaGustavo: 8.0, notaEnzo: 7.0, notaMiguel: 7.0, notaMedia: 7.33 },
  { id: 'm5', nome: 'Léo', tipo: 'Mensalista', posicaoFixa: 'Linha', statusPresenca: true, notaGustavo: 8.5, notaEnzo: 8.0, notaMiguel: 8.0, notaMedia: 8.17 },
  { id: 'm6', nome: 'Gui Almeida', tipo: 'Mensalista', posicaoFixa: 'Linha', statusPresenca: true, notaGustavo: 8.0, notaEnzo: 7.5, notaMiguel: 7.0, notaMedia: 7.5 },
  { id: 'm7', nome: 'Gui Cortijo', tipo: 'Mensalista', posicaoFixa: 'Linha', statusPresenca: true, notaGustavo: 7.0, notaEnzo: 7.0, notaMiguel: 7.0, notaMedia: 7.0 },
  { id: 'm8', nome: 'Cussiol', tipo: 'Mensalista', posicaoFixa: 'Linha', statusPresenca: true, notaGustavo: 7.5, notaEnzo: 7.0, notaMiguel: 7.0, notaMedia: 7.17 },
  { id: 'm9', nome: 'Enzo Ferro', tipo: 'Mensalista', posicaoFixa: 'Linha', statusPresenca: true, notaGustavo: 8.5, notaEnzo: 8.0, notaMiguel: 8.0, notaMedia: 8.17 },
  { id: 'm10', nome: 'Rafa', tipo: 'Mensalista', posicaoFixa: 'Linha', statusPresenca: true, notaGustavo: 7.5, notaEnzo: 7.0, notaMiguel: 7.0, notaMedia: 7.17 },
  { id: 'm11', nome: 'Pirani', tipo: 'Mensalista', posicaoFixa: 'Linha', statusPresenca: true, notaGustavo: 7.5, notaEnzo: 6.5, notaMiguel: 6.0, notaMedia: 6.67 },
  { id: 'm12', nome: 'Tavares', tipo: 'Mensalista', posicaoFixa: 'Linha', statusPresenca: true, notaGustavo: 6.0, notaEnzo: 5.0, notaMiguel: 5.0, notaMedia: 5.33 },
  { id: 'm13', nome: 'Alex', tipo: 'Mensalista', posicaoFixa: 'Linha', statusPresenca: true, notaGustavo: 9.5, notaEnzo: 9.5, notaMiguel: 10.0, notaMedia: 9.67 },
  { id: 'm14', nome: 'Gustavo', tipo: 'Mensalista', posicaoFixa: 'Linha', statusPresenca: true, notaGustavo: 8.5, notaEnzo: 8.5, notaMiguel: 9.0, notaMedia: 8.67 },
  { id: 'm15', nome: 'Jotapê', tipo: 'Mensalista', posicaoFixa: 'Linha', statusPresenca: true, notaGustavo: 7.0, notaEnzo: 5.5, notaMiguel: 5.0, notaMedia: 5.83 },
  { id: 'm16', nome: 'Jeroen', tipo: 'Mensalista', posicaoFixa: 'Linha', statusPresenca: true, notaGustavo: 9.0, notaEnzo: 9.0, notaMiguel: 9.0, notaMedia: 9.0 },
  { id: 'm17', nome: 'Thiaguinho', tipo: 'Mensalista', posicaoFixa: 'Linha', statusPresenca: true, notaGustavo: 8.5, notaEnzo: 8.5, notaMiguel: 8.5, notaMedia: 8.5 },
  { id: 'm18', nome: 'Felipe', tipo: 'Mensalista', posicaoFixa: 'Linha', statusPresenca: true, notaGustavo: 7.5, notaEnzo: 7.0, notaMiguel: 7.0, notaMedia: 7.17 },
  
  // Goleiros
  { id: 'g1', nome: 'Thales', tipo: 'Mensalista', posicaoFixa: 'Goleiro', statusPresenca: true, notaGustavo: 7.0, notaEnzo: 7.0, notaMiguel: 7.0, notaMedia: 7.0 },
  { id: 'g2', nome: 'Pedezzotti', tipo: 'Mensalista', posicaoFixa: 'Goleiro', statusPresenca: true, notaGustavo: 7.0, notaEnzo: 7.0, notaMiguel: 7.0, notaMedia: 7.0 },
  { id: 'g3', nome: 'Herbert', tipo: 'Mensalista', posicaoFixa: 'Goleiro', statusPresenca: true, notaGustavo: 7.0, notaEnzo: 7.0, notaMiguel: 7.0, notaMedia: 7.0 },
  { id: 'g4', nome: 'Pedro Bigode', tipo: 'Mensalista', posicaoFixa: 'Goleiro', statusPresenca: true, notaGustavo: 7.0, notaEnzo: 7.0, notaMiguel: 7.0, notaMedia: 7.0 },
  { id: 'g5', nome: 'Bololo', tipo: 'Mensalista', posicaoFixa: 'Goleiro', statusPresenca: true, notaGustavo: 7.0, notaEnzo: 7.0, notaMiguel: 7.0, notaMedia: 7.0 },
  { id: 'g6', nome: 'Igor', tipo: 'Mensalista', posicaoFixa: 'Goleiro', statusPresenca: true, notaGustavo: 7.0, notaEnzo: 7.0, notaMiguel: 7.0, notaMedia: 7.0 }
];

function PenaltySoccerBallLogo({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#FFFFFF" stroke="#166534" strokeWidth="4" />
      <polygon points="50,30 35,41 41,58 59,58 65,41" fill="#14532d" />
      <polygon points="50,12 37,2 20,10 22,28 35,30" fill="#1e293b" />
      <polygon points="50,12 63,2 80,10 78,28 65,30" fill="#1e293b" />
      <polygon points="65,41 78,28 92,35 92,53 78,61" fill="#14532d" />
      <polygon points="59,58 78,61 80,80 62,88 50,75" fill="#1e293b" />
      <polygon points="41,58 22,61 20,80 38,88 50,75" fill="#1e293b" />
      <polygon points="35,41 22,28 8,35 8,53 22,61" fill="#14532d" />
      <line x1="50" y1="30" x2="50" y2="12" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="35" y1="41" x2="22" y2="28" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="65" y1="41" x2="78" y2="28" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="41" y1="58" x2="22" y2="61" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="59" y1="58" x2="78" y2="61" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="50" y1="75" x2="50" y2="92" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="50" cy="50" r="46" stroke="#15803d" strokeWidth="3" strokeDasharray="6 4" />
    </svg>
  );
}

function TacticalPitchCard({ teamName, teamData, isDrafted }) {
  const linePlayers = isDrafted && teamData?.players ? teamData.players : [];
  
  const getPlayerLabel = (index) => {
    if (isDrafted && linePlayers[index]) {
      const name = linePlayers[index].nome.split(' ')[0];
      return name.length > 7 ? name.substring(0, 6) + '..' : name;
    }
    return '?';
  };

  return (
    <div className="bg-emerald-950/90 border border-emerald-800/80 rounded-2xl p-2.5 shadow-md text-center text-white relative overflow-hidden flex flex-col justify-between">
      <div className="border-b border-emerald-800/70 pb-1 mb-1.5">
        <span className="font-black text-xs text-emerald-100 uppercase tracking-wide">{teamName}</span>
      </div>
      
      <div className="w-full bg-emerald-900/90 border border-emerald-700/50 rounded-xl p-2 relative h-48 flex flex-col justify-around items-center my-1 shadow-inner">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-700/40 -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-10 h-10 border border-emerald-700/40 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 left-1/2 w-16 h-5 border-b border-x border-emerald-700/40 -translate-x-1/2 rounded-b-lg" />
        <div className="absolute bottom-0 left-1/2 w-16 h-5 border-t border-x border-emerald-700/40 -translate-x-1/2 rounded-t-lg" />

        {/* 1. Defesa / Fixo */}
        <div className="w-7 h-7 rounded-full bg-emerald-950/90 border border-emerald-300/80 text-emerald-200 text-[9px] font-black flex items-center justify-center mx-auto z-10 shadow-sm truncate px-0.5">
          {getPlayerLabel(0)}
        </div>
        
        {/* 2. Meio / Alas */}
        <div className="grid grid-cols-2 gap-4 w-full z-10 px-1">
          <div className="w-7 h-7 rounded-full bg-emerald-950/90 border border-emerald-300/80 text-emerald-200 text-[9px] font-black flex items-center justify-center mx-auto shadow-sm truncate px-0.5">
            {getPlayerLabel(1)}
          </div>
          <div className="w-7 h-7 rounded-full bg-emerald-950/90 border border-emerald-300/80 text-emerald-200 text-[9px] font-black flex items-center justify-center mx-auto shadow-sm truncate px-0.5">
            {getPlayerLabel(2)}
          </div>
        </div>

        {/* 3. Ataque / Pivôs */}
        <div className="grid grid-cols-2 gap-4 w-full z-10 px-1">
          <div className="w-7 h-7 rounded-full bg-emerald-950/90 border border-emerald-300/80 text-emerald-200 text-[9px] font-black flex items-center justify-center mx-auto shadow-sm truncate px-0.5">
            {getPlayerLabel(3)}
          </div>
          <div className="w-7 h-7 rounded-full bg-emerald-950/90 border border-emerald-300/80 text-emerald-200 text-[9px] font-black flex items-center justify-center mx-auto shadow-sm truncate px-0.5">
            {getPlayerLabel(4)}
          </div>
        </div>
      </div>

      <span className="text-[8px] font-extrabold text-emerald-200/90 mt-1 uppercase tracking-wider">
        {isDrafted ? `Média: ${(teamData?.ratingSum / 5).toFixed(1)} ⭐` : 'Aguardando Sorteio'}
      </span>
    </div>
  );
}

export default function App() {
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('fc_players_v13');
    return saved ? JSON.parse(saved) : MENSALISTAS_DADOS;
  });

  const [generatedTeams, setGeneratedTeams] = useState(() => {
    const saved = localStorage.getItem('fc_teams_v13');
    return saved ? JSON.parse(saved) : [];
  });

  const [freeGoalkeepers, setFreeGoalkeepers] = useState(() => {
    const saved = localStorage.getItem('fc_free_gk_v13');
    return saved ? JSON.parse(saved) : [];
  });

  const [teamsDrafted, setTeamsDrafted] = useState(() => {
    const saved = localStorage.getItem('fc_teams_drafted_v13');
    return saved ? JSON.parse(saved) : false;
  });

  // --- FIREBASE REALTIME STATE SYNC ---
  const [firebaseConfig, setFirebaseConfig] = useState(() => {
    const saved = localStorage.getItem('fc_firebase_cfg');
    return saved ? JSON.parse(saved) : null;
  });
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [firebaseInput, setFirebaseInput] = useState('');
  const dbRef = useRef(null);

  // --- PWA INSTALLATION PROMPT ---
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIOSInstallModal, setShowIOSInstallModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          triggerAlert("App instalado com sucesso! 📱", "success");
        }
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      });
    } else {
      // Check if iOS Safari
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        setShowIOSInstallModal(true);
      } else {
        triggerAlert("Acesse no navegador Chrome/Safari do seu celular para instalar!", "info");
      }
    }
  };

  useEffect(() => {
    if (!firebaseConfig) return;
    try {
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
      dbRef.current = db;
      setFirebaseConnected(true);

      const docRef = doc(db, 'pelada', 'fut_cefas_state');
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.players) setPlayers(data.players);
          if (data.generatedTeams) setGeneratedTeams(data.generatedTeams);
          if (data.freeGoalkeepers) setFreeGoalkeepers(data.freeGoalkeepers);
          if (typeof data.teamsDrafted === 'boolean') setTeamsDrafted(data.teamsDrafted);
        }
      }, (err) => {
        console.warn("Firebase snapshot error:", err);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Firebase init error:", err);
      setFirebaseConnected(false);
    }
  }, [firebaseConfig]);

  // Push updates to Firebase + LocalStorage
  const syncStateToFirestore = async (newPlayers, newTeams, newGks, newDrafted) => {
    localStorage.setItem('fc_players_v13', JSON.stringify(newPlayers));
    localStorage.setItem('fc_teams_v13', JSON.stringify(newTeams));
    localStorage.setItem('fc_free_gk_v13', JSON.stringify(newGks));
    localStorage.setItem('fc_teams_drafted_v13', JSON.stringify(newDrafted));

    if (dbRef.current && firebaseConnected) {
      try {
        await setDoc(doc(dbRef.current, 'pelada', 'fut_cefas_state'), {
          players: newPlayers,
          generatedTeams: newTeams,
          freeGoalkeepers: newGks,
          teamsDrafted: newDrafted,
          updatedAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn("Could not sync to Firestore:", e);
      }
    }
  };

  const [activeTab, setActiveTab] = useState('times');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Modal Avulso
  const [showAddAvulsoModal, setShowAddAvulsoModal] = useState(false);
  const [avulsoNomeInput, setAvulsoNomeInput] = useState('');
  const [avulsoPosicaoInput, setAvulsoPosicaoInput] = useState('Linha');

  // Drag and Drop
  const [draggedPlayerId, setDraggedPlayerId] = useState(null);
  const [dragOverZone, setDragOverZone] = useState(null);

  // ADM Mode
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [adminError, setAdminError] = useState('');
  const logoClicksRef = useRef({ count: 0, lastClick: 0 });

  // Notifications & Rating Modal
  const [systemAlert, setSystemAlert] = useState({ show: false, message: '', type: 'info' });
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingTargetPlayer, setRatingTargetPlayer] = useState(null);
  const [tempNotes, setTempNotes] = useState({ gustavo: 7.0, enzo: 7.0, miguel: 7.0 });

  const triggerAlert = (message, type = 'info') => {
    setSystemAlert({ show: true, message, type });
    setTimeout(() => {
      setSystemAlert({ show: false, message: '', type: 'info' });
    }, 3500);
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
        triggerAlert("Modo ADM desativado", "info");
      } else {
        setShowAdminModal(true);
      }
    }
  };

  const handleAdminAuth = (e) => {
    e.preventDefault();
    if (passwordInput.toLowerCase() === 'futebol') {
      setIsAdmin(true);
      setShowAdminModal(false);
      setPasswordInput('');
      setAdminError('');
      triggerAlert("Autenticado como ADM! 🛠️", "success");
    } else {
      setAdminError("Senha incorreta!");
    }
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    setActiveTab('times');
    triggerAlert("Modo ADM encerrado", "info");
  };

  const handleSaveFirebaseConfig = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(firebaseInput);
      setFirebaseConfig(parsed);
      localStorage.setItem('fc_firebase_cfg', JSON.stringify(parsed));
      setShowFirebaseModal(false);
      setFirebaseInput('');
      triggerAlert("Configuração do Firebase salva com sucesso!", "success");
    } catch (err) {
      triggerAlert("JSON do Firebase inválido. Verifique e tente novamente.", "error");
    }
  };

  const handleCopyTeams = () => {
    if (!teamsDrafted || generatedTeams.length === 0) {
      triggerAlert("Sorteie os times primeiro para poder copiar!", "info");
      return;
    }

    const text = generatedTeams.map(t => {
      const playerNames = t.players.map(p => p.nome).join('\n');
      return `${t.name}\n${playerNames}`;
    }).join('\n\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      triggerAlert("Lista de times copiada com sucesso! 📋", "success");
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      triggerAlert("Lista de times copiada! 📋", "success");
    }
  };

  const handleAddAvulso = (e) => {
    e.preventDefault();
    if (!avulsoNomeInput.trim()) return;

    const newAvulso = {
      id: `avulso-${Date.now()}`,
      nome: avulsoNomeInput.trim(),
      tipo: 'Avulso',
      posicaoFixa: avulsoPosicaoInput,
      statusPresenca: true,
      notaGustavo: 7.0,
      notaEnzo: 7.0,
      notaMiguel: 7.0,
      notaMedia: 7.0
    };

    const updated = [...players, newAvulso];
    setPlayers(updated);
    syncStateToFirestore(updated, generatedTeams, freeGoalkeepers, teamsDrafted);
    setAvulsoNomeInput('');
    setShowAddAvulsoModal(false);
    triggerAlert(`Avulso "${newAvulso.nome}" adicionado com nota 7.0!`, "success");
  };

  const handleChangePosition = (playerId, targetPosition) => {
    const updated = players.map(p => {
      if (p.id === playerId) {
        return { ...p, posicaoFixa: targetPosition };
      }
      return p;
    });
    setPlayers(updated);
    syncStateToFirestore(updated, generatedTeams, freeGoalkeepers, teamsDrafted);
  };

  const handleDragStart = (e, playerId) => {
    e.dataTransfer.setData('text/plain', playerId);
    setDraggedPlayerId(playerId);
  };

  const handleDragOver = (e, zone) => {
    e.preventDefault();
    if (dragOverZone !== zone) {
      setDragOverZone(zone);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverZone(null);
  };

  const handleDrop = (e, targetPosition) => {
    e.preventDefault();
    const playerId = e.dataTransfer.getData('text/plain') || draggedPlayerId;
    if (playerId) {
      handleChangePosition(playerId, targetPosition);
      const player = players.find(p => p.id === playerId);
      if (player) {
        triggerAlert(`${player.nome} movido para ${targetPosition}!`, "info");
      }
    }
    setDraggedPlayerId(null);
    setDragOverZone(null);
  };

  const handleDraftTeams = () => {
    if (!isAdmin) {
      triggerAlert("🔒 Apenas ADMs podem tirar o time!", "info");
      return;
    }

    const presentPlayers = players.filter(p => p.statusPresenca);
    const presentGoleiros = presentPlayers.filter(p => p.posicaoFixa === 'Goleiro');
    const presentLine = presentPlayers.filter(p => p.posicaoFixa === 'Linha');

    if (presentLine.length < 15) {
      triggerAlert(`Precisa de 15 de linha pra 3 times! Atualmente: ${presentLine.length}`, "error");
      return;
    }

    const sortedLines = [...presentLine].sort((a, b) => b.notaMedia - a.notaMedia);

    const teams = [
      { id: 't-1', name: 'Time 1', players: [], goalkeeper: presentGoleiros[0] || null, ratingSum: 0 },
      { id: 't-2', name: 'Time 2', players: [], goalkeeper: presentGoleiros[1] || null, ratingSum: 0 },
      { id: 't-3', name: 'Time 3', players: [], goalkeeper: presentGoleiros[2] || null, ratingSum: 0 }
    ];

    let ascending = true;
    let teamIndex = 0;

    for (let i = 0; i < 15; i++) {
      const player = sortedLines[i];
      teams[teamIndex].players.push(player);
      teams[teamIndex].ratingSum += player.notaMedia;

      if (ascending) {
        if (teamIndex === 2) {
          ascending = false;
        } else {
          teamIndex++;
        }
      } else {
        if (teamIndex === 0) {
          ascending = true;
        } else {
          teamIndex--;
        }
      }
    }

    setGeneratedTeams(teams);
    setFreeGoalkeepers(presentGoleiros);
    setTeamsDrafted(true);
    syncStateToFirestore(players, teams, presentGoleiros, true);
    triggerAlert("3 Times divididos com sucesso!", "success");
    setActiveTab('times');
  };

  const handleLiberarNovaPresenca = () => {
    if (!isAdmin) return;
    setGeneratedTeams([]);
    setFreeGoalkeepers([]);
    setTeamsDrafted(false);
    syncStateToFirestore(players, [], [], false);
    setActiveTab('presenca');
    triggerAlert("Lista aberta para a próxima pelada!", "success");
  };

  const handleTogglePresence = (playerId) => {
    const updated = players.map(p => {
      if (p.id === playerId) {
        return { ...p, statusPresenca: !p.statusPresenca };
      }
      return p;
    });
    setPlayers(updated);
    syncStateToFirestore(updated, generatedTeams, freeGoalkeepers, teamsDrafted);
  };

  const handleRemovePlayer = (playerId) => {
    if (!isAdmin) return;
    const updated = players.filter(p => p.id !== playerId);
    setPlayers(updated);
    syncStateToFirestore(updated, generatedTeams, freeGoalkeepers, teamsDrafted);
    triggerAlert("Jogador removido!", "info");
  };

  const handleOpenRatingModal = (player) => {
    if (!isAdmin) return;
    setRatingTargetPlayer(player);
    setTempNotes({
      gustavo: player.notaGustavo || 7.0,
      enzo: player.notaEnzo || 7.0,
      miguel: player.notaMiguel || 7.0
    });
    setShowRatingModal(true);
  };

  const handleSaveRatings = () => {
    if (!ratingTargetPlayer) return;
    
    const avg = parseFloat(((tempNotes.gustavo + tempNotes.enzo + tempNotes.miguel) / 3).toFixed(2));

    const updated = players.map(p => {
      if (p.id === ratingTargetPlayer.id) {
        return {
          ...p,
          notaGustavo: tempNotes.gustavo,
          notaEnzo: tempNotes.enzo,
          notaMiguel: tempNotes.miguel,
          notaMedia: avg
        };
      }
      return p;
    });

    setPlayers(updated);
    syncStateToFirestore(updated, generatedTeams, freeGoalkeepers, teamsDrafted);
    setShowRatingModal(false);
    setRatingTargetPlayer(null);
    triggerAlert("Notas salvas!", "success");
  };

  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return players;
    return players.filter(p => p.nome.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [players, searchQuery]);

  const linePlayers = useMemo(() => filteredPlayers.filter(p => p.posicaoFixa === 'Linha'), [filteredPlayers]);
  const goalkeeperPlayers = useMemo(() => filteredPlayers.filter(p => p.posicaoFixa === 'Goleiro'), [filteredPlayers]);

  const lineMensalistas = useMemo(() => linePlayers.filter(p => p.tipo === 'Mensalista'), [linePlayers]);
  const lineAvulsos = useMemo(() => linePlayers.filter(p => p.tipo === 'Avulso'), [linePlayers]);

  const confirmadosCount = useMemo(() => players.filter(p => p.statusPresenca).length, [players]);

  const selectRatingOptions = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= 10; i += 0.5) {
      arr.push(i);
    }
    return arr;
  }, []);

  return (
    <div className="min-h-screen bg-emerald-950/20 text-slate-800 flex flex-col font-sans select-none pb-20">
      
      {/* ALERTA FLUTUANTE */}
      {systemAlert.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 border bg-white border-green-100 animate-fadeIn">
          <span className={`w-2.5 h-2.5 rounded-full ${
            systemAlert.type === 'success' ? 'bg-green-600' :
            systemAlert.type === 'error' ? 'bg-rose-500' : 'bg-sky-500'
          }`} />
          <span className="text-xs font-bold text-slate-700">{systemAlert.message}</span>
        </div>
      )}

      {/* BANNER INSTALAÇÃO PWA */}
      {showInstallBanner && (
        <div className="bg-emerald-800 text-white p-2 px-4 flex items-center justify-between text-xs z-50 shadow-md">
          <span className="font-bold flex items-center gap-1.5">
            📱 Instale o Fut Cefas no seu celular!
          </span>
          <button 
            onClick={handleInstallPWA}
            className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-black px-3 py-1 rounded-full text-[10px] active:scale-95 transition"
          >
            Instalar
          </button>
        </div>
      )}

      {/* HEADER COMPACTO */}
      <header className="sticky top-0 bg-emerald-900/95 backdrop-blur-md border-b border-emerald-800/60 p-3 flex flex-col items-center justify-between z-40 text-white shadow-md">
        <div className="flex items-center justify-between w-full max-w-md">
          <div 
            onClick={handleLogoClick} 
            className="flex items-center gap-2.5 cursor-pointer py-1 px-2 rounded-2xl hover:bg-emerald-800/50 active:scale-95 transition"
            title="3 cliques para modo ADM"
          >
            <div className="bg-white p-1 rounded-full flex items-center justify-center shadow-md border border-emerald-400/40">
              <PenaltySoccerBallLogo className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                Fut Cefas
                {firebaseConnected && (
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" title="Firebase Conectado Em Tempo Real" />
                )}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleInstallPWA}
              className="bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 p-1.5 rounded-full border border-emerald-600/50 text-[11px]"
              title="Instalar App no Celular"
            >
              📲
            </button>

            {isAdmin && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowFirebaseModal(true)}
                  className={`text-[9px] font-black px-2 py-1 rounded-full border ${
                    firebaseConnected 
                      ? 'bg-emerald-900 text-emerald-200 border-emerald-600' 
                      : 'bg-amber-500/20 text-amber-300 border-amber-400'
                  }`}
                  title="Configurar Conexão Firebase"
                >
                  {firebaseConnected ? '🔥 On' : '⚡ Config Firebase'}
                </button>

                <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-950 animate-pulse" />
                  ADM
                </span>
                <button
                  onClick={handleLogoutAdmin}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black px-2 py-1 rounded-full transition active:scale-95 shadow-sm flex items-center gap-1"
                  title="Sair do Modo ADM"
                >
                  🚪 Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL DO APP */}
      <main className="flex-1 max-w-md w-full mx-auto px-3.5 py-3 flex flex-col justify-between">

        {/* --- ABA 1: TIMES (MÓDULO PRINCIPAL DE VISUALIZAÇÃO) --- */}
        {activeTab === 'times' && (
          <div className="space-y-3 animate-fadeIn">
            
            {/* CARD SUPERIOR DE STATUS DE SORTEIO */}
            <div className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-sm text-center">
              <h3 className="font-black text-sm text-green-950 uppercase tracking-wide">
                {teamsDrafted ? 'TIMES ESCALADOS' : 'TIME VAI SER TIRADO JAJÁ'}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {teamsDrafted 
                  ? 'Confira os times formados para a pelada de hoje.' 
                  : 'Aguardando o ADM confirmar a lista e fazer o sorteio.'}
              </p>
            </div>

            {/* MINICAMPOS TÁTICOS LADO A LADO */}
            <div className="grid grid-cols-3 gap-2">
              <TacticalPitchCard 
                teamName="Time 1" 
                teamData={generatedTeams[0]} 
                isDrafted={teamsDrafted} 
              />
              <TacticalPitchCard 
                teamName="Time 2" 
                teamData={generatedTeams[1]} 
                isDrafted={teamsDrafted} 
              />
              <TacticalPitchCard 
                teamName="Time 3" 
                teamData={generatedTeams[2]} 
                isDrafted={teamsDrafted} 
              />
            </div>

            {/* SEÇÃO DE GOLEIROS & BOTÃO COPIAR TIMES */}
            <div className="bg-emerald-900/90 border border-emerald-700/60 rounded-2xl p-3 shadow-sm text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1">
                  🧤 Goleiros
                </span>

                <button
                  onClick={handleCopyTeams}
                  className="bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-emerald-100 border border-emerald-600/60 font-black text-[10px] px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                  title="Copiar lista formatada dos times"
                >
                  <svg className="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  <span>copie os times aqui</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 py-1">
                {freeGoalkeepers.length > 0 ? (
                  freeGoalkeepers.map(gk => (
                    <div 
                      key={gk.id} 
                      className="bg-amber-400 text-amber-950 font-black text-[10px] px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-amber-300"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-900" />
                      {gk.nome}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center gap-3 py-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-sm border border-amber-300 animate-pulse" />
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-sm border border-amber-300 animate-pulse" />
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-sm border border-amber-300 animate-pulse" />
                  </div>
                )}
              </div>
            </div>

            {/* DETALHAMENTO DOS JOGADORES DOS TIMES DRAFTADOS */}
            {teamsDrafted && (
              <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm space-y-2">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="font-extrabold text-xs text-green-950">Escalação das Equipes</h4>
                  {isAdmin && (
                    <button
                      onClick={handleLiberarNovaPresenca}
                      className="text-[9px] font-black text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-full border border-rose-200/60 transition active:scale-95"
                      title="Apagar times e abrir nova chamada"
                    >
                      🔄 Nova Chamada
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {generatedTeams.map((team) => (
                    <div key={team.id} className="bg-slate-50 border border-slate-100 rounded-xl p-2">
                      <div className="text-center border-b border-slate-200/60 pb-1 mb-1.5">
                        <span className="font-black text-[10px] text-green-950">{team.name}</span>
                      </div>
                      <div className="space-y-1">
                        {team.players.map((p) => (
                          <div key={p.id} className="py-0.5 px-1 bg-white rounded border border-slate-100 text-[8px] font-bold text-slate-700 truncate">
                            🏃 {p.nome}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* --- ABA 2: PRESENÇA (DISPONÍVEL APENAS PARA ADM) --- */}
        {activeTab === 'presenca' && isAdmin && (
          <div className="space-y-3 animate-fadeIn">
            
            <div className="bg-white border border-green-900/10 rounded-3xl p-3.5 shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-green-950">Lista de quem vai</h3>
                  
                  <button 
                    onClick={() => setShowSearchModal(true)}
                    className="p-1.5 bg-green-50 hover:bg-green-100 rounded-xl text-green-800 transition active:scale-95 text-xs"
                    title="Acha alguém aí"
                  >
                    🔍
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black text-green-800 bg-green-50 px-2 py-0.5 rounded-full border border-green-200/50">
                    {confirmadosCount} vão hoje
                  </span>

                  <button 
                    onClick={() => setShowAddAvulsoModal(true)}
                    className="bg-green-700 hover:bg-green-800 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full transition active:scale-95 shadow-sm"
                  >
                    + Avulso
                  </button>
                </div>
              </div>

              <p className="text-[9px] text-slate-400 mb-2">
                Só clicar no nome pra colocar a presença. Arraste pra trocar a posição.
              </p>

              {/* SEÇÕES DE DRAG AND DROP */}
              <div className="space-y-2">
                
                {/* 1. SEÇÃO DE GOLEIROS */}
                <div 
                  onDragOver={(e) => handleDragOver(e, 'Goleiro')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'Goleiro')}
                  className={`p-2 rounded-2xl border-2 transition ${
                    dragOverZone === 'Goleiro' 
                      ? 'bg-sky-50 border-sky-400 border-dashed scale-[1.01]' 
                      : 'bg-slate-50/80 border-sky-100'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1 px-1">
                    <span className="text-[10px] font-black uppercase text-sky-800 tracking-wider flex items-center gap-1">
                      🧤 Goleiros ({goalkeeperPlayers.length})
                    </span>
                    <span className="text-[8px] text-sky-600 font-semibold">Goleiros soltos</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 min-h-[45px]">
                    {goalkeeperPlayers.length === 0 ? (
                      <div className="col-span-3 text-center py-2 text-[9px] text-slate-400 italic border border-dashed border-sky-200 rounded-xl">
                        Arraste pra cá pra colocar de Goleiro.
                      </div>
                    ) : (
                      goalkeeperPlayers.map((p) => (
                        <div 
                          key={p.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, p.id)}
                          onClick={() => handleTogglePresence(p.id)}
                          className="flex flex-col items-center text-center cursor-pointer relative p-1.5 rounded-xl hover:bg-white active:scale-95 transition border border-sky-200 bg-white shadow-2xs group"
                        >
                          <div className="relative">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black transition ${
                              p.statusPresenca ? 'bg-sky-100 text-sky-900 border-2 border-sky-500' : 'bg-slate-200 text-slate-400'
                            }`}>
                              {p.nome.substring(0, 2).toUpperCase()}
                            </div>
                            
                            {p.statusPresenca && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-sky-500 text-white rounded-full flex items-center justify-center text-[7px] font-black border border-white">
                                ✓
                              </span>
                            )}
                          </div>

                          <span className="text-[9px] font-extrabold text-slate-800 truncate w-full mt-0.5">
                            {p.nome}
                          </span>

                          {p.tipo === 'Avulso' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleRemovePlayer(p.id); }}
                              className="text-[8px] text-rose-500 font-bold hover:underline mt-0.5"
                            >
                              Excluir
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. SEÇÃO JOGADORES DE LINHA */}
                <div 
                  onDragOver={(e) => handleDragOver(e, 'Linha')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'Linha')}
                  className={`p-2 rounded-2xl border-2 transition ${
                    dragOverZone === 'Linha' 
                      ? 'bg-green-50 border-green-500 border-dashed scale-[1.01]' 
                      : 'bg-slate-50/80 border-green-900/10'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1 px-1">
                    <span className="text-[10px] font-black uppercase text-green-900 tracking-wider flex items-center gap-1">
                      🏃 Linha ({linePlayers.length})
                    </span>
                    <span className="text-[8px] text-green-700 font-semibold">15 pra 3 times</span>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2 max-h-[280px] overflow-y-auto p-0.5 min-h-[80px]">
                    {linePlayers.length === 0 ? (
                      <div className="col-span-3 md:col-span-5 text-center py-3 text-[9px] text-slate-400 italic border border-dashed border-green-200 rounded-xl">
                        Nenhum jogador de linha aqui. Arraste pra cá.
                      </div>
                    ) : (
                      <>
                        {lineMensalistas.map((p) => (
                          <div 
                            key={p.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, p.id)}
                            onClick={() => handleTogglePresence(p.id)}
                            className="flex flex-col items-center text-center cursor-pointer relative p-1.5 rounded-xl hover:bg-white active:scale-95 transition border border-slate-100 bg-white shadow-2xs group"
                          >
                            <div className="relative">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black transition ${
                                p.statusPresenca ? 'bg-green-100 text-green-900 border-2 border-green-700' : 'bg-slate-200 text-slate-400'
                              }`}>
                                {p.nome.substring(0, 2).toUpperCase()}
                              </div>
                              
                              {p.statusPresenca && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-700 text-white rounded-full flex items-center justify-center text-[7px] font-black border border-white">
                                  ✓
                                </span>
                              )}
                            </div>

                            <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Mensal</span>

                            <span className="text-[9px] font-extrabold text-slate-800 truncate w-full mt-0.5">
                              {p.nome}
                            </span>
                          </div>
                        ))}

                        {lineAvulsos.length > 0 && (
                          <div className="col-span-3 md:col-span-5 my-1 border-t border-slate-200/60 pt-1 flex items-center justify-center">
                            <span className="text-[8px] font-extrabold uppercase text-slate-400 px-2 bg-slate-100 rounded-full">
                              Avulsos
                            </span>
                          </div>
                        )}

                        {lineAvulsos.map((p) => (
                          <div 
                            key={p.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, p.id)}
                            onClick={() => handleTogglePresence(p.id)}
                            className="flex flex-col items-center text-center cursor-pointer relative p-1.5 rounded-xl hover:bg-white active:scale-95 transition border border-amber-200/80 bg-amber-50/30 shadow-2xs group"
                          >
                            <div className="relative">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black transition ${
                                p.statusPresenca ? 'bg-amber-100 text-amber-900 border-2 border-amber-500' : 'bg-slate-200 text-slate-400'
                              }`}>
                                {p.nome.substring(0, 2).toUpperCase()}
                              </div>
                              
                              {p.statusPresenca && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-600 text-white rounded-full flex items-center justify-center text-[7px] font-black border border-white">
                                  ✓
                                </span>
                              )}
                            </div>

                            <span className="text-[7px] font-bold text-amber-600 uppercase tracking-tighter mt-0.5">Avulso</span>

                            <span className="text-[9px] font-extrabold text-slate-800 truncate w-full mt-0.5">
                              {p.nome}
                            </span>

                            <button 
                              onClick={(e) => { e.stopPropagation(); handleRemovePlayer(p.id); }}
                              className="text-[8px] text-rose-500 font-bold hover:underline mt-0.5"
                            >
                              Excluir
                            </button>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

              </div>

              {/* BOTÃO TIRAR TIME */}
              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <button 
                  onClick={handleDraftTeams}
                  className="w-full bg-green-800 hover:bg-green-900 text-white font-black py-3 rounded-2xl shadow-sm shadow-green-900/20 active:scale-95 transition text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  ⚽ Tirar time
                </button>
              </div>

            </div>

          </div>
        )}

        {/* --- ABA 3: "NOTAS" (VISÍVEL APENAS PARA ADM) --- */}
        {activeTab === 'notas' && isAdmin && (
          <div className="space-y-3 animate-fadeIn">
            <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-extrabold text-sm text-slate-900">Notas dos ADMs</h3>
                <span className="text-[9px] font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                  Só ADM
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mb-3">Notas dos 3 ADMs (Gustavo, Enzo, Miguel) de 1.0 a 10.0.</p>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {players.map((p) => (
                  <div key={p.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800">{p.nome}</span>
                        {p.tipo === 'Avulso' && (
                          <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Avulso</span>
                        )}
                        {p.posicaoFixa === 'Goleiro' && (
                          <span className="bg-sky-50 text-sky-700 text-[8px] font-black px-1.5 py-0.5 rounded border border-sky-100 uppercase">GK</span>
                        )}
                      </div>
                      <div className="flex gap-2 text-[9px] text-slate-400 font-bold mt-1">
                        <span>G: <strong className="text-slate-600">{p.notaGustavo?.toFixed(1) || '7.0'}</strong></span>
                        <span>E: <strong className="text-slate-600">{p.notaEnzo?.toFixed(1) || '7.0'}</strong></span>
                        <span>M: <strong className="text-slate-600">{p.notaMiguel?.toFixed(1) || '7.0'}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-green-800 bg-green-50 px-2 py-0.5 rounded-full border border-green-200/50">
                        {p.notaMedia.toFixed(1)}
                      </span>

                      <button 
                        onClick={() => handleOpenRatingModal(p)}
                        className="bg-green-700 hover:bg-green-800 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-xl shadow-xs transition"
                      >
                        Mudar nota
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* NAV BAR INFERIOR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 p-2.5 flex justify-around z-40 shadow-xl max-w-md mx-auto rounded-t-3xl">
        {isAdmin && (
          <button 
            onClick={() => setActiveTab('presenca')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition ${activeTab === 'presenca' ? 'text-green-800 bg-green-50/70 font-black' : 'text-slate-400'}`}
          >
            <span className="text-base">📋</span>
            <span className="text-[9px] uppercase tracking-wider font-bold">Quem vai</span>
          </button>
        )}

        <button 
          onClick={() => setActiveTab('times')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition ${activeTab === 'times' ? 'text-green-800 bg-green-50/70 font-black' : 'text-slate-400'}`}
        >
          <span className="text-base">🛡️</span>
          <span className="text-[9px] uppercase tracking-wider font-bold">Times</span>
        </button>

        {isAdmin && (
          <button 
            onClick={() => setActiveTab('notas')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition ${activeTab === 'notas' ? 'text-green-800 bg-green-50/70 font-black' : 'text-slate-400'}`}
          >
            <span className="text-base">⭐</span>
            <span className="text-[9px] uppercase tracking-wider font-bold">Notas</span>
          </button>
        )}
      </nav>

      {}
      {/* MODAL CONFIGURAR FIREBASE */}
      {showFirebaseModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 w-full max-w-sm shadow-2xl">
            <h3 className="font-extrabold text-sm text-slate-900 mb-1">Configurar Firebase Realtime</h3>
            <p className="text-[10px] text-slate-400 mb-3">Cole o JSON do `firebaseConfig` do seu console do Firebase.</p>

            <form onSubmit={handleSaveFirebaseConfig} className="space-y-3">
              <textarea
                rows="6"
                placeholder='{ "apiKey": "AIzaSy...", "authDomain": "...", "projectId": "...", "storageBucket": "...", "messagingSenderId": "...", "appId": "..." }'
                value={firebaseInput}
                onChange={(e) => setFirebaseInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[10px] font-mono text-slate-800 focus:outline-none focus:border-green-700"
                required
              />

              <div className="flex gap-2 pt-1">
                <button 
                  type="button"
                  onClick={() => setShowFirebaseModal(false)}
                  className="flex-1 bg-slate-100 text-slate-500 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-green-700 text-white font-black py-2.5 rounded-xl text-xs"
                >
                  Conectar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GUIA IOS PWA */}
      {showIOSInstallModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 w-full max-w-sm shadow-2xl text-center">
            <span className="text-3xl mb-2 block">📲</span>
            <h3 className="font-extrabold text-sm text-slate-900 mb-1">Instalar no iPhone / iPad</h3>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
              1. Toque no botão de <strong>Compartilhar 📤</strong> no Safari (na parte inferior do navegador).<br />
              2. Role para baixo e selecione <strong>"Adicionar à Tela de Início" ➕</strong>.
            </p>
            <button 
              onClick={() => setShowIOSInstallModal(false)}
              className="w-full bg-green-700 text-white font-black py-2.5 rounded-xl text-xs"
            >
              Entendido!
            </button>
          </div>
        </div>
      )}

      {/* MODAL "ACHA ALGUÉM AÍ" */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-extrabold text-sm text-slate-900">Acha alguém aí</h3>
              <button 
                onClick={() => setShowSearchModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="relative mb-3">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">🔍</span>
              <input 
                type="text" 
                placeholder="Digite o nome..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-8 pr-3 text-xs text-slate-800 font-bold focus:outline-none focus:border-green-700"
                autoFocus
              />
            </div>

            {searchQuery && (
              <p className="text-[10px] text-slate-400 mb-2">Achei {filteredPlayers.length} jogador(es)</p>
            )}

            <button 
              onClick={() => setShowSearchModal(false)}
              className="w-full bg-green-700 text-white font-black py-2.5 rounded-xl text-xs"
            >
              Pronto
            </button>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR AVULSO */}
      {showAddAvulsoModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 w-full max-w-sm shadow-2xl">
            <h3 className="font-extrabold text-sm text-slate-900 mb-1">Adicionar Avulso</h3>
            <p className="text-[10px] text-slate-400 mb-4">Nome do jogador avulso (já entra com nota 7.0 no sorteio).</p>

            <form onSubmit={handleAddAvulso} className="space-y-3">
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Nome do Avulso</label>
                <input 
                  type="text" 
                  placeholder="Ex: Paulinho" 
                  value={avulsoNomeInput}
                  onChange={(e) => setAvulsoNomeInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 font-bold focus:outline-none focus:border-green-700"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Posição</label>
                <select
                  value={avulsoPosicaoInput}
                  onChange={(e) => setAvulsoPosicaoInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 font-bold focus:outline-none focus:border-green-700"
                >
                  <option value="Linha">🏃 Linha</option>
                  <option value="Goleiro">🧤 Goleiro</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddAvulsoModal(false)}
                  className="flex-1 bg-slate-100 text-slate-500 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-green-700 text-white font-black py-2.5 rounded-xl text-xs"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE SENHA ADM */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 mb-2">Entrar como ADM</h3>
            <p className="text-xs text-slate-400 mb-5">Coloque a senha pra mudar as notas dos jogadores.</p>

            <form onSubmit={handleAdminAuth} className="space-y-4">
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Senha</label>
                <input 
                  type="password"
                  placeholder="Senha do ADM"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-xs text-slate-700 focus:outline-none"
                  autoFocus
                />
              </div>

              {adminError && (
                <p className="text-xs text-rose-500 font-bold">{adminError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => { setShowAdminModal(false); setPasswordInput(''); setAdminError(''); }}
                  className="flex-1 bg-slate-100 text-slate-500 font-bold py-3.5 rounded-2xl text-xs"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-green-700 text-white font-black py-3.5 rounded-2xl text-xs"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOTAS ADM */}
      {showRatingModal && ratingTargetPlayer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 mb-1">Dar nota pro jogador</h3>
            <p className="text-xs text-slate-400 mb-4">Notas para <strong className="text-slate-700">{ratingTargetPlayer.nome}</strong>:</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-700">Gustavo</span>
                <select 
                  value={tempNotes.gustavo}
                  onChange={(e) => setTempNotes({ ...tempNotes, gustavo: parseFloat(e.target.value) })}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-700 focus:outline-none font-bold"
                >
                  {selectRatingOptions.map(val => (
                    <option key={val} value={val}>{val.toFixed(1)}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-700">Enzo</span>
                <select 
                  value={tempNotes.enzo}
                  onChange={(e) => setTempNotes({ ...tempNotes, enzo: parseFloat(e.target.value) })}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-700 focus:outline-none font-bold"
                >
                  {selectRatingOptions.map(val => (
                    <option key={val} value={val}>{val.toFixed(1)}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-700">Miguel</span>
                <select 
                  value={tempNotes.miguel}
                  onChange={(e) => setTempNotes({ ...tempNotes, miguel: parseFloat(e.target.value) })}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-700 focus:outline-none font-bold"
                >
                  {selectRatingOptions.map(val => (
                    <option key={val} value={val}>{val.toFixed(1)}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="font-extrabold text-slate-500">Média:</span>
                <span className="font-black text-green-800 bg-green-50 px-3 py-1 rounded-full border border-green-200/50">
                  {((tempNotes.gustavo + tempNotes.enzo + tempNotes.miguel) / 3).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button 
                type="button"
                onClick={() => { setShowRatingModal(false); setRatingTargetPlayer(null); }}
                className="flex-1 bg-slate-100 text-slate-500 font-bold py-3 rounded-2xl text-xs"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={handleSaveRatings}
                className="flex-1 bg-green-700 text-white font-extrabold py-3 rounded-2xl text-xs"
              >
                Salvar notas
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}