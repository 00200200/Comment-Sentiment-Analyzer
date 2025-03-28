import { Link } from "@tanstack/react-router";
import Logo from "@/../public/logo-full.svg";
import { Search } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between max-w-5xl mx-auto m-8 px-4">
      <Link to="/" className="flex items-center">
        <img src={Logo} alt="Emotube Logo" className="h-10 cursor-pointer" />
      </Link>
      <Search className="w-6 h-6 text-white" />
    </header>
  );
}
