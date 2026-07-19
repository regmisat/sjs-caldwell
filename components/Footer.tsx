import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-20 border-t border-white/20 bg-black/60 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm text-white/80">
            For questions or support, please contact{" "}
            <a
              href="mailto:sji@caldwell.edu"
              className="font-medium text-white hover:underline"
            >
              sji@caldwell.edu
            </a>
          </p>
          <p className="text-sm text-white/80">
            Support our mission:{" "}
            <a
              href="https://secure.qgiv.com/for/socialjusticesymposium"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white hover:underline"
            >
              Make a Donation {/* external link */}
              <ExternalLink className="inline-block ml-1 mb-0.5 h-4 w-4" />
            </a>
          </p>
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} Caldwell University. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
