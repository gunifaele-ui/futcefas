import { useRef, useState } from 'react';
import Avatar from '../Avatar';
import BottomSheet from '../BottomSheet';
import { resizeImageFile } from '../../utils/imageResize';

export default function EditPlayerModal({ player, onSave, onClose }) {
  const [nome, setNome] = useState(player.nome);
  const [foto, setFoto] = useState(player.foto || '');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const resized = await resizeImageFile(file, 160);
    setFoto(resized);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nome.trim()) return;
    onSave({ nome: nome.trim(), foto });
  };

  return (
    <BottomSheet onClose={onClose}>
      <h3 className="font-black text-sm text-fc-dark mb-1">🖼️ Editar Jogador</h3>
      <p className="text-[11px] text-slate-400 mb-4 font-bold">Troque o nome e a foto de perfil.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center gap-2">
          <Avatar nome={nome} foto={foto} size="w-20 h-20" textSize="text-lg" />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-black text-fc-dark bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition"
            >
              📷 Trocar foto
            </button>
            {foto && (
              <button
                type="button"
                onClick={() => setFoto('')}
                className="text-[11px] font-black text-fc-coraldark bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-full transition"
              >
                Remover foto
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>

        <input
          type="text"
          placeholder="Nome do jogador"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full bg-fc-cream border border-slate-200 rounded-2xl py-3 px-4 text-xs text-fc-dark focus:outline-none focus:border-fc-dark focus:ring-2 focus:ring-fc-lime/40 font-bold transition"
        />

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-3 rounded-full text-xs transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 bg-fc-lime hover:brightness-95 text-fc-dark font-black py-3 rounded-full text-xs transition shadow-sm"
          >
            Salvar
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
