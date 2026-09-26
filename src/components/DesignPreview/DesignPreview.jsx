import NailCanvas from '../NailCanvas/NailCanvas';

export default function DesignPreview({ design }) {
  return (
    <div className="design-preview">
      <h3>{design.name}</h3>
      <div className="design-preview__nails">
        {design.nails.map((nail) => (
          <NailCanvas key={nail.finger} nail={nail} size={90} />
        ))}
      </div>
    </div>
  );
}
