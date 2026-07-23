import { useState } from 'react';
import BottomSheet from '../BottomSheet';
import Icon from '../Icon';

export default function AdminModal({ admins, passwordInput, setPasswordInput, adminError, onSubmit, onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const adminNames = admins.map((a) => a.label).join(', ');

  return (
    <BottomSheet onClose={onClose}>
      <h3 className="text-[15px] font-semibold text-fc-dark mb-1 flex items-center gap-2">
        <Icon name="lock" size={16} className="text-fc-dark/60" /> Entrar como ADM
      </h3>
      <p className="text-[12px] text-fc-muted mb-4 leading-relaxed">
        Digite sua senha pessoal ({adminNames}), ou "Visualização" pra entrar só pra ver, sem poder editar nada.
      </p>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Senha de acesso"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full bg-fc-cream border border-fc-line rounded-xl py-3 pl-4 pr-11 text-[13px] text-fc-dark placeholder:text-fc-muted focus:outline-none focus:border-fc-dark/30 focus:bg-white font-medium transition"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg text-fc-muted hover:text-fc-dark flex items-center justify-center transition"
            title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Icon name={showPassword ? 'eyeOff' : 'eye'} size={16} />
          </button>
        </div>

        {adminError && <p className="text-[12px] text-fc-coraldark font-medium">{adminError}</p>}

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
            Entrar
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
