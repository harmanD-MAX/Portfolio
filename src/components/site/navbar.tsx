"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, Linkedin, Menu, X } from "lucide-react";

function useActiveSection() {
  const [activeSection, setActiveSection] = useState("about");

  useEffect(() => {
    const sectionIds = ["about", "experience", "skills", "projects", "contact"];

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // If reached the bottom of the page, activate contact
      if (windowHeight + scrollY >= docHeight - 90) {
        setActiveSection("contact");
        return;
      }

      // Check section positions relative to viewport
      const threshold = windowHeight * 0.35;
      let current = "about";

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= threshold) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return activeSection;
}

function NavLink({
  href,
  children,
  active,
  onClick,
}: {
  href: string;
  children: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`nav-link mono ${active ? "is-active" : ""}`}
    >
      {children}
    </Link>
  );
}

export function SiteNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const activeSection = useActiveSection();
  const pathname = usePathname();

  const closeMenu = () => setMenuOpen(false);

  const handleBrandClick = (e: React.MouseEvent) => {
    if (pathname === "/" || pathname === "") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header
      id="top"
      className="site-header"
    >
      {/* Main nav row */}
      <div className="page-wrap nav-shell flex items-center justify-between">
        <Link
          href="/"
          onClick={handleBrandClick}
          className="brand-lockup group inline-flex items-center text-[hsl(var(--foreground))] cursor-pointer"
          aria-label="Home page - Back to top"
        >
          <span className="serif text-2xl md:text-3xl font-normal italic tracking-tight transition-transform duration-300 group-hover:scale-105">
            h<span className="text-primary not-italic font-mono transition-opacity group-hover:opacity-80">_</span>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-8 md:flex">
          <NavLink href="/#about" active={pathname === "/" && activeSection === "about"}>
            About
          </NavLink>
          <NavLink href="/#experience" active={pathname === "/" && activeSection === "experience"}>
            Experience
          </NavLink>
          <NavLink href="/#skills" active={pathname === "/" && activeSection === "skills"}>
            Skills
          </NavLink>
          <NavLink href="/#projects" active={pathname === "/" && activeSection === "projects"}>
            Projects
          </NavLink>
          <NavLink href="/#contact" active={pathname === "/" && activeSection === "contact"}>
            Contact
          </NavLink>
          <NavLink href="/blog" active={pathname?.startsWith("/blog")}>
            Blog
          </NavLink>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <a
            href="https://www.linkedin.com/in/harmanp01"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="social-link"
          >
            <Linkedin size={16} strokeWidth={1.7} />
          </a>
          <a
            href="https://github.com/harmanD-MAX"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="social-link"
          >
            <Github size={17} strokeWidth={1.7} />
          </a>
          <a href="mailto:harmanbofficial@gmail.com" className="mono say-hello">
            Say hello
          </a>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="mobile-menu-button md:hidden cursor-pointer"
        >
          {menuOpen ? <X size={17} /> : <Menu size={17} />}
        </button>
      </div>

      {menuOpen && (
        <div className="page-wrap mobile-menu md:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-5">
            <NavLink href="/#about" active={pathname === "/" && activeSection === "about"} onClick={closeMenu}>
              About
            </NavLink>
            <NavLink href="/#experience" active={pathname === "/" && activeSection === "experience"} onClick={closeMenu}>
              Experience
            </NavLink>
            <NavLink href="/#skills" active={pathname === "/" && activeSection === "skills"} onClick={closeMenu}>
              Skills
            </NavLink>
            <NavLink href="/#projects" active={pathname === "/" && activeSection === "projects"} onClick={closeMenu}>
              Projects
            </NavLink>
            <NavLink href="/#contact" active={pathname === "/" && activeSection === "contact"} onClick={closeMenu}>
              Contact
            </NavLink>
            <NavLink href="/blog" active={pathname?.startsWith("/blog")} onClick={closeMenu}>
              Blog
            </NavLink>
            <div className="flex items-center gap-5 border-t border-[hsl(var(--border))] pt-5">
              <a
                href="https://www.linkedin.com/in/harmanp01"
                target="_blank"
                rel="noreferrer"
                className="mono"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com/harmanD-MAX"
                target="_blank"
                rel="noreferrer"
                className="mono"
              >
                GitHub
              </a>
              <a href="mailto:harmanbofficial@gmail.com" className="mono">
                Email
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
