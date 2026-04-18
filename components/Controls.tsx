type ControlsProps = {
  onResetTemplate: () => void;
  onClear: () => void;
  onPrint: () => void;
  onDownloadPdf: () => void;
  onSave: () => void;
  onLoad: () => void;
};

export default function Controls({ onResetTemplate, onClear, onPrint, onDownloadPdf, onSave, onLoad }: ControlsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/30 bg-white/25 p-4">
      <button type="button" onClick={onResetTemplate} className="btn-secondary">
        Reset to Template
      </button>
      <button type="button" onClick={onClear} className="btn-secondary">
        Clear
      </button>
      <button type="button" onClick={onPrint} className="btn-primary">
        Print
      </button>
      <button type="button" onClick={onDownloadPdf} className="btn-primary">
        Download PDF
      </button>
      <button type="button" onClick={onSave} className="btn-secondary">
        Save to MySQL
      </button>
      <button type="button" onClick={onLoad} className="btn-secondary">
        Load Latest
      </button>
    </div>
  );
}
