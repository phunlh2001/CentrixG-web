import { ReactNode } from 'react';
type BaseDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  children?: ReactNode;
  width?: string;
  showOverlay?: boolean;
  className?: string;
  content?: ReactNode;
};
export default function BaseDrawer({
  isOpen,
  onClose,
  position = 'left',
  children,
  content,
}: BaseDrawerProps) {
  const slideClass =
    position === 'left'
      ? isOpen
        ? 'translate-x-0'
        : '-translate-x-full'
      : isOpen
        ? 'translate-x-0'
        : 'translate-x-full';

  return (
    <>
      {isOpen && (
        <div
          className="z-40 fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 max-w-80 bg-zinc-800 shadow-2xl z-50 
                   transform transition-transform duration-300 ease-out 
                   ${position === 'left' ? 'left-0' : 'right-0'} 
                   ${slideClass}`}
      >
        <div className="h-full overflow-y-auto">
          {content ? content : children}
        </div>
      </div>
    </>
  );
}
