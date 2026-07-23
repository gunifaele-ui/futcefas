import { useRef, useState } from 'react';
import Avatar from '../Avatar';
import BottomSheet from '../BottomSheet';
import Icon from '../Icon';
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
      <h3 className="text-[15px] font-semibold text-fc-dark mb-1 flex items-center gap-2">
        <Icon name="image" size={16} className="text-fc-dark/60" /> Editar jogador
      </h3>
      <p className="text-[12px] text-fc-muted mb-4">Troque o nome e a foto de perfil.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center gap-2.5">
          <Avatar nome={nome} foto={foto} size="w-20 h-20" textSize="text-lg" />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[12px] font-medium text-fc-dark bg-fc-cream hover:bg-fc-line px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
            >
              <Icon name="image" size={13} /> Trocar foto
            </button>
            {foto && (
              <button
                type="button"
                onClick={() => setFoto('')}
                className="text-[12px] font-medium text-fc-coraldark bg-white border border-fc-line hover:bg-orange-50 px-3 py-1.5 rounded-lg transition"
              >
                Remover
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
          className="w-full bg-fc-cream border border-fc-line rounded-xl py-3 px-4 text-[13px] text-fc-dark placeholder:text-fc-muted focus:outline-none focus:border-fc-dark/30 focus:bg-white font-medium transition"
        />

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-fc-cream hover:bg-fc-line text-fc-dark/70 font-medium py-3 rounded-xl text-[13px] transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 bg-fc-dark hover:bg-fc-dark2 text-white font-medium py-3 rounded-xl text-[13px] transition"
          >
            Salvar
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
