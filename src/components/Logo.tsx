import { Link } from "react-router-dom";
import logoImage from "../assets/images/image.png";

interface LogoProps {
  size?: "small" | "medium" | "large" | "xlarge";
  withText?: boolean;
  linkTo?: string;
  className?: string;
}

const Logo = ({ 
  size = "medium", 
  withText = true, 
  linkTo,
  className = ""
}: LogoProps) => {
  const LogoContent = () => (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src={logoImage}
        alt="LIVHE Logo" 
        className={`
          ${size === "small" ? "h-8" : ""}
          ${size === "medium" ? "h-12" : ""}
          ${size === "large" ? "h-16" : ""}
          ${size === "xlarge" ? "h-24" : ""}
        `}
      />
      {withText && (
        <span className="text-xl font-bold ml-2 sr-only">LIVHE</span>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-block">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
};

export default Logo;
