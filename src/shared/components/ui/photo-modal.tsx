import { XIcon } from '@heroicons/react/solid';

interface PhotoModalProps {
  isOpen: boolean;
  photo: { src: string; title: string } | null;
  onClose: () => void;
}

export function PhotoModal({ isOpen, photo, onClose }: PhotoModalProps) {
  if (!isOpen || !photo) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-h-[90vh] w-full h-full flex items-center justify-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
        >
          <XIcon className="w-6 h-6 text-white" />
        </button>
        <div className="text-center">
          <h3 className="text-white text-xl font-semibold mb-4">
            {photo.title}
          </h3>
          <img
            src={photo.src || '/placeholder.svg'}
            alt={photo.title}
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
}
