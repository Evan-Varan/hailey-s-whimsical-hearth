import { Instagram, Mail, Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8 items-start">
        <div>
          <p className="font-hand text-3xl text-primary">Hailey Adkins</p>
          <p className="font-serif-display italic text-sm text-muted-foreground mt-2 max-w-xs">
            A small magical journal — made by hand, with tea & moonlight.
          </p>
        </div>
        <nav className="font-serif-display italic text-sm text-muted-foreground flex flex-col gap-2 md:items-center">
          <Link to="/journal" className="hover:text-primary">Journal</Link>
          <Link to="/hobbies" className="hover:text-primary">Hobbies</Link>
          <Link to="/gallery" className="hover:text-primary">Gallery</Link>
          <Link to="/about" className="hover:text-primary">About</Link>
        </nav>
        <div className="md:text-right">
          <p className="font-sans-ui text-[11px] uppercase tracking-[0.25em] text-muted-foreground">find me</p>
          <div className="flex md:justify-end items-center gap-2 mt-3">
            <a href="#" aria-label="Instagram" className="p-2 rounded-full hover:bg-muted transition-colors"><Instagram className="w-4 h-4" /></a>
            <a href="#" aria-label="Email" className="p-2 rounded-full hover:bg-muted transition-colors"><Mail className="w-4 h-4" /></a>
            <a href="#" aria-label="Pinterest" className="p-2 rounded-full hover:bg-muted transition-colors"><Heart className="w-4 h-4" /></a>
          </div>
          <p className="font-serif-display italic text-xs text-muted-foreground mt-6">
            © {new Date().getFullYear()} ✦ all small magic reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
