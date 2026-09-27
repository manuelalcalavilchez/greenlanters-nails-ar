import { useRef, useState } from 'react';

const FINGERS = [
  { id: 'thumb', label: 'Pulgar' },
  { id: 'index', label: 'Índice' },
  { id: 'middle', label: 'Medio' },
  { id: 'ring', label: 'Anular' },
  { id: 'pinky', label: 'Meñique' },
];

function makeTemplate() {
  const canvas = document.createElement('canvas');
  canvas.width = 1500;
  canvas.height = 520;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff8fb';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#6b3b50';
  ctx.font = 'bold 34px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LAS GREENLANTERS NAILS · PLANTILLA 5 UÑAS', 750, 48);
  FINGERS.forEach((finger, i) => {
    const x = 30 + i * 300;
    const w = 240;
    const h = 360;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#d59ab2';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(x, 85, w, h, 85);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#6b3b50';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(finger.label.toUpperCase(), x + w / 2, 480);
  });
  return canvas.toDataURL('image/png');
}

export default function FullDesignUpload({ design, onLoad }) {
  const inputRef = useRef(null);
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState('');
  function downloadTemplate() {
    const link = document.createElement('a');
    link.download = 'plantilla-las-greenlanters-5-unas.png';
    link.href = makeTemplate();
    link.click();
    setStatus('Plantilla descargada. Diseña sobre ella y vuelve a subirla.');
  }

  function handleUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setStatus('Usa PNG, JPG o WebP.');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setStatus('El archivo no puede superar 12 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result;
      const image = new Image();
      image.onload = () => {
        if (image.width < 1000 || image.height < 350) {
          setStatus('La plantilla debe tener al menos 1000 × 350 px.');
          return;
        }
        const nextNails = design.nails.map((nail, index) => ({
          ...nail,
          decorations: [{
            type: 'image',
            src,
            mode: 'template-nail',
            slot: index,
            templateWidth: image.width,
            templateHeight: image.height,
            x: 0.5,
            y: 0.5,
            rotation: 0,
            scale: 1,
          }],
        }));
        const next = {
          ...design,
          name: design.name || 'Diseño personalizado',
          source: 'custom-template',
          template: 'las-greenlanters-5-nails-v1',
          nails: nextNails,
        };
        setPreview(src);
        onLoad(next);
        setStatus('✓ Diseño de 5 uñas cargado. Revísalo y guárdalo.');
      };
      image.src = src;
    };
    reader.readAsDataURL(file);
  }

  return (
    <section className="full-design-upload">
      <div className="full-design-upload__head">
        <div>
          <h2>Sube tu diseño de 5 uñas</h2>
          <p>Descarga nuestra plantilla, diseña las cinco uñas y súbela aquí.</p>
        </div>
        <button type="button" onClick={downloadTemplate}>Descargar plantilla</button>
      </div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp"
        onChange={handleUpload} hidden />
      <button type="button" className="primary full-design-upload__button"
        onClick={() => inputRef.current?.click()}>＋ Cargar diseño completo</button>
      {preview && <img className="full-design-upload__preview" src={preview} alt="Vista previa del diseño cargado" />}
      {status && <p className="full-design-upload__status" role="status">{status}</p>}
    </section>
  );
}
