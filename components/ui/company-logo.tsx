import logoImage from "./assets/logo.png";

interface CompanyLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  clickable?: boolean;
}

export function CompanyLogo({ size = 'md', showText = true, className = '', clickable = false }: CompanyLogoProps) {
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-20 w-20',
    xl: 'h-24 w-24'
  };

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const handleClick = () => {
    if (clickable) {
      window.location.hash = 'dashboard';
    }
  };

  return (
    <div
      className={`flex items-center gap-3 ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
      onClick={handleClick}
    >
      <img
        src={logoImage}
        alt="Ehub Project Management Logo"
        className={`${sizeClasses[size]} object-contain`}
      />
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizeClasses[size]} leading-none tracking-tight text-primary font-bold`}>
            Ehub
          </span>
          <span className="text-xs text-muted-foreground mt-0.5">
            Project Management
          </span>
        </div>
      )}
    </div>
  );
}