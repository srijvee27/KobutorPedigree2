"use client";

type ImageUploaderProps = {
  imageDataUrl: string;
  onChange: (value: string) => void;
};

export default function ImageUploader({ imageDataUrl, onChange }: ImageUploaderProps) {
  const handleFile = (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Only JPG or PNG files are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Maximum file size is 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-xl border border-white/30 bg-white/20 p-4">
      <label className="mb-2 block text-sm font-semibold text-slate-900">Main pigeon image</label>
      <input
        type="file"
        accept=".jpg,.jpeg,.png"
        onChange={(event) => handleFile(event.target.files?.[0])}
        className="w-full rounded-md border border-white/40 bg-white/60 p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-white"
      />
      <p className="mt-2 text-xs text-slate-700">
        Recommended: 300x300px (minimum 150x150px), JPG/PNG, max 2MB
      </p>
      <div className="mt-3 flex h-[150px] w-[150px] items-center justify-center overflow-hidden rounded-md border border-slate-300 bg-white">
        {imageDataUrl ? (
          <img src={imageDataUrl} alt="Pigeon preview" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-slate-400">No image selected</span>
        )}
      </div>
    </div>
  );
}
