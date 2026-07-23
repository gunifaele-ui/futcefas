import { useState } from 'react';
import BottomSheet from '../BottomSheet';

export default function AdminModal({ passwordInput, setPasswordInput, adminError, onSubmit, onClose }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <BottomSheet onClose={onClose}>
      <h3 className="font-black text-sm text-fc-dark mb-1">🔐 Entrar como ADM</h3>
      <p className="text-[11px] text-slate-400 mb-4 font-bold">Digite sua senha pessoal (Gustavo, Miguel ou Enzo).</p>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Senha de acesso"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full bg-fc-cream border border-slate-200 rounded-2xl py-3 pl-4 pr-11 text-xs text-fc-dark focus:outline-none focus:border-fc-dark focus:ring-2 focus:ring-fc-lime/40 font-bold transition"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl text-slate-400 hover:text-fc-dark flex items-center justify-center text-sm transition"
            title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        {adminError && <p className="text-xs text-fc-coraldark font-bold">{adminError}</p>}

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
            Entrar
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
