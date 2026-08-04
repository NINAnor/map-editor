import classNames from 'classnames';
import { isEmoji } from '../libs/icon';

interface MapIconProps {
  icon: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: { img: 'max-w-10 max-h-10', emoji: 'text-3xl' },
  md: { img: 'max-w-16 max-h-16', emoji: 'text-4xl' },
  lg: { img: 'max-w-20 max-h-20', emoji: 'text-5xl' },
  xl: { img: 'max-w-full max-h-24', emoji: 'text-6xl' },
};

/**
 * Renders a map icon, supporting both image URLs and emojis
 */
export function MapIcon({ icon, size = 'md', className }: MapIconProps) {
  const sizes = sizeClasses[size];

  if (isEmoji(icon)) {
    return <span className={classNames('flex items-center justify-center', sizes.emoji, className)}>{icon}</span>;
  }

  return <img src={icon} alt="" className={classNames(sizes.img, className)} />;
}
