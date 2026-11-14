import { Link } from "react-router-dom";
import { BrainCircuit } from "lucide-react";
import "./BrandLogo.css";

function BrandLogo() {
  return (
    <Link to="/" className="brand-logo">
      <BrainCircuit size={27} strokeWidth={1.8} />

      <span className="brand-logo-text">
        ProbeReady
      </span>
    </Link>
  );
}

export default BrandLogo;