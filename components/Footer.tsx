export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 text-xs text-[color:var(--ink)]/60">
        <p>© {new Date().getFullYear()} Scrylytics</p>
        <div className="flex gap-4">
          <a>Docs</a><a>Privacy</a><a>Contact</a>
        </div>
      </div>
    </footer>
  );
}
