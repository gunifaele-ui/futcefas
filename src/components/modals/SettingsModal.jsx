import { useState } from 'react';
import BottomSheet from '../BottomSheet';
import Icon from '../Icon';

export default function SettingsModal({ admins, onAddAdmin, onToggleHidden, onDeleteAdmin, onEditPassword, onClose }) {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const [editingSenha, setEditingSenha] = useState('');
  const [editError, setEditError] = useState('');

  const startEditPassword = (key) => {
    setEditingKey(key);
    setEditingSenha('');
    setEditError('');
  };

  const handleSavePassword = (key) => {
    const result = onEditPassword(key, editingSenha);
    if (result?.error) {
      setEditError(result.error);
      return;
    }
    setEditingKey(null);
    setEditingSenha('');
    setEditError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nome.trim() || !senha.trim()) {
      setError('Preencha nome e senha.');
      return;
    }
    const result = onAddAdmin(nome.trim(), senha.trim());
    if (result?.error) {
      setError(result.error);
      return;
    }
    setNome('');
    setSenha('');
    setError('');
  };

  return (
    <BottomSheet onClose={onClose}>
      <h3 className="text-[15px] font-semibold text-fc-dark mb-1 flex items-center gap-2">
        <Icon name="settings" size={16} className="text-fc-dark/60" /> Configurações
      </h3>
      <p className="text-[12px] text-fc-muted mb-4 leading-relaxed">
        Gerencie os ADMs que avaliam os jogadores. Ocultar um ADM tira a nota dele da média e some com ele da tela de notas.
      </p>

      <div className="space-y-2 mb-4">
        {admins.map((adm) => (
          <div key={adm.key} className="border border-fc-line rounded-xl p-2.5">
            <div className="flex items-center gap-2">
              <span className={`text-[13px] font-medium flex-1 ${adm.hidden ? 'text-fc-muted line-through' : 'text-fc-dark'}`}>
                {adm.label}
              </span>
              {adm.hidden && (
                <span className="text-[10px] font-medium text-fc-muted bg-fc-cream px-2 py-0.5 rounded-full shrink-0">Oculto</span>
              )}
              <button
                type="button"
                onClick={() => (editingKey === adm.key ? setEditingKey(null) : startEditPassword(adm.key))}
                title="Redefinir senha"
                className="w-7 h-7 rounded-lg bg-fc-cream hover:bg-fc-line text-fc-dark/70 flex items-center justify-center shrink-0 transition"
              >
                <Icon name="pencil" size={14} />
              </button>
              <button
                type="button"
                onClick={() => onToggleHidden(adm.key)}
                title={adm.hidden ? 'Mostrar ADM' : 'Ocultar ADM'}
                className="w-7 h-7 rounded-lg bg-fc-cream hover:bg-fc-line text-fc-dark/70 flex items-center justify-center shrink-0 transition"
              >
                <Icon name={adm.hidden ? 'eyeOff' : 'eye'} size={14} />
              </button>
              <button
                type="button"
                onClick={() => onDeleteAdmin(adm.key)}
                title="Excluir ADM"
                className="w-7 h-7 rounded-lg bg-white hover:bg-orange-50 border border-fc-line text-fc-coraldark flex items-center justify-center shrink-0 transition"
              >
                <Icon name="trash" size={14} />
              </button>
            </div>
            {editingKey === adm.key && (
              <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-fc-line">
                <input
                  type="text"
                  autoFocus
                  placeholder="Nova senha"
                  value={editingSenha}
                  onChange={(e) => setEditingSenha(e.target.value)}
                  className="flex-1 min-w-0 bg-fc-cream border border-fc-line rounded-xl py-2 px-3 text-[13px] text-fc-dark placeholder:text-fc-muted focus:outline-none focus:border-fc-dark/30 focus:bg-white font-medium transition"
                />
                <button
                  type="button"
                  onClick={() => handleSavePassword(adm.key)}
                  title="Salvar nova senha"
                  className="w-8 h-8 rounded-lg bg-fc-dark hover:bg-fc-dark2 text-white flex items-center justify-center shrink-0 transition"
                >
                  <Icon name="check" size={14} />
                </button>
              </div>
            )}
            {editingKey === adm.key && editError && (
              <p className="text-[11px] text-fc-coraldark font-medium mt-1.5">{editError}</p>
            )}
          </div>
        ))}
        {admins.length === 0 && <p className="text-[12px] text-fc-muted text-center py-3">Nenhum ADM cadastrado.</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2 border-t border-fc-line pt-4">
        <p className="text-[12px] font-medium text-fc-dark/70">Novo ADM</p>
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full bg-fc-cream border border-fc-line rounded-xl py-2.5 px-3.5 text-[13px] text-fc-dark placeholder:text-fc-muted focus:outline-none focus:border-fc-dark/30 focus:bg-white font-medium transition"
        />
        <input
          type="text"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full bg-fc-cream border border-fc-line rounded-xl py-2.5 px-3.5 text-[13px] text-fc-dark placeholder:text-fc-muted focus:outline-none focus:border-fc-dark/30 focus:bg-white font-medium transition"
        />
        {error && <p className="text-[12px] text-fc-coraldark font-medium">{error}</p>}
        <button
          type="submit"
          className="w-full bg-fc-dark hover:bg-fc-dark2 text-white font-medium py-2.5 rounded-xl text-[13px] transition flex items-center justify-center gap-2"
        >
          <Icon name="plus" size={14} /> Adicionar ADM
        </button>
      </form>

      <div className="pt-4">
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-fc-cream hover:bg-fc-line text-fc-dark/70 font-medium py-3 rounded-xl text-[13px] transition"
        >
          Fechar
        </button>
      </div>
    </BottomSheet>
  );
}
