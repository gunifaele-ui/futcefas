import { useRef, useState } from 'react';
import BottomSheet from './BottomSheet';
import Icon from './Icon';

const FRAME_W = 220;

export default function PhotoPositionModal({ src, naturalWidth, naturalHeight, aspectW, aspectH, outputWidth, outputHeight, onConfirm, onCancel }) {
  const frameH = Math.round((FRAME_W * aspectH) / aspectW);
  const baseScale = Math.max(FRAME_W / naturalWidth, frameH / naturalHeight);

  const clampFor = (z, x, y) => {
    const s = baseScale * z;
    const w = naturalWidth * s;
    const h = naturalHeight * s;
    const minX = Math.min(0, FRAME_W - w);
    const minY = Math.min(0, frameH - h);
    return { x: Math.max(minX, Math.min(0, x)), y: Math.max(minY, Math.min(0, y)) };
  };

  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState(clampFor(1, (FRAME_W - naturalWidth * baseScale) / 2, (frameH - naturalHeight * baseScale) / 2));
  const dragState = useRef(null);

  const scale = baseScale * zoom;
  const dispW = naturalWidth * scale;
  const dispH = naturalHeight * scale;

  const startDrag = (clientX, clientY) => {
    dragState.current = { startX: clientX, startY: clientY, origin: pos };
  };

  const moveDrag = (clientX, clientY) => {
    if (!dragState.current) return;
    const { startX, startY, origin } = dragState.current;
    setPos(clampFor(zoom, origin.x + (clientX - startX), origin.y + (clientY - startY)));
  };

  const endDrag = () => {
    dragState.current = null;
  };

  const handleZoomChange = (e) => {
    const z = parseFloat(e.target.value);
    setZoom(z);
    setPos((p) => clampFor(z, p.x, p.y));
  };

  const handleConfirm = () => {
    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#F5F6F3';
    ctx.fillRect(0, 0, outputWidth, outputHeight);

    const factor = outputWidth / FRAME_W;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, pos.x * factor, pos.y * factor, dispW * factor, dispH * factor);
      onConfirm(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = src;
  };

  return (
    <BottomSheet onClose={onCancel}>
      <h3 className="text-[15px] font-semibold text-fc-dark mb-1 flex items-center gap-2">
        <Icon name="image" size={16} className="text-fc-dark/60" /> Posicionar foto
      </h3>
      <p className="text-[12px] text-fc-muted mb-4">Arraste para centralizar e use o zoom para ajustar o enquadramento.</p>

      <div
        className="relative mx-auto overflow-hidden rounded-xl bg-fc-cream ring-1 ring-fc-line touch-none select-none cursor-move"
        style={{ width: FRAME_W, height: frameH }}
        onMouseDown={(e) => {
          startDrag(e.clientX, e.clientY);
          const onMove = (ev) => moveDrag(ev.clientX, ev.clientY);
          const onUp = () => {
            endDrag();
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
          };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}
        onTouchStart={(e) => {
          const t = e.touches[0];
          startDrag(t.clientX, t.clientY);
        }}
        onTouchMove={(e) => {
          const t = e.touches[0];
          moveDrag(t.clientX, t.clientY);
        }}
        onTouchEnd={endDrag}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          className="absolute top-0 left-0 max-w-none pointer-events-none"
          style={{ width: dispW, height: dispH, transform: `translate(${pos.x}px, ${pos.y}px)` }}
        />
      </div>

      <div className="flex items-center gap-2.5 mt-3.5 px-1">
        <Icon name="search" size={13} className="text-fc-muted shrink-0" />
        <input
          type="range"
          min="1"
          max="2.5"
          step="0.01"
          value={zoom}
          onChange={handleZoomChange}
          className="w-full accent-fc-dark"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-fc-cream hover:bg-fc-line text-fc-dark/70 font-medium py-3 rounded-xl text-[13px] transition"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="flex-1 bg-fc-dark hover:bg-fc-dark2 text-white font-medium py-3 rounded-xl text-[13px] transition"
        >
          Usar foto
        </button>
      </div>
    </BottomSheet>
  );
}
