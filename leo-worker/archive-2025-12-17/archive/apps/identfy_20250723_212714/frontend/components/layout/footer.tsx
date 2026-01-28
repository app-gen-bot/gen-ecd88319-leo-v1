import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div>© 2024 Identfy. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/system-status" className="hover:text-foreground">
                System Status
              </Link>
            </div>
          </div>
          <div>Powered by PlanetScale</div>
        </div>
      </div>
    </footer>
  );
}