import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { useState, useEffect } from "react";
import Home from "@/pages/home";
import QuickMatch from "@/pages/quick-match";
import MatchPlay from "@/pages/match-play";
import DraftAI from "@/pages/draft-ai";
import Draft2P from "@/pages/draft-2p";
import CareerSetup from "@/pages/career-setup";
import CareerDashboard from "@/pages/career-dashboard";
import Packs from "@/pages/packs";
import CardDatabase from "@/pages/card-database";
import PlayerDetail from "@/pages/player-detail";
import MyTeam from "@/pages/my-team";
import SBCs from "@/pages/sbcs";
import Quests from "@/pages/quests";
import NotFound from "@/pages/not-found";
import { getCoins } from "@/lib/game-store";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } }
});

function CoinDisplay() {
  const [coins, setCoins] = useState(getCoins());
  useEffect(() => {
    const sync = () => setCoins(getCoins());
    window.addEventListener("cm-coins-updated", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("cm-coins-updated", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);
  return (
    <Link href="/my-team" className="flex items-center gap-1.5 bg-card border border-border/50 rounded-xl px-3 py-1.5 hover:border-primary/50 transition-colors">
      <span className="text-base">🪙</span>
      <span className="text-sm font-display font-black text-primary">{coins.toLocaleString()}</span>
    </Link>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isHome = location === "/";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src={`${import.meta.env.BASE_URL}images/hero-stadium.png`} className="w-full h-full object-cover opacity-[0.07] mix-blend-luminosity" alt="Background" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <nav className="border-b border-border/40 bg-background/60 backdrop-blur-2xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-8 h-8 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(255,180,0,0.5)]" />
              <span className="font-display font-black text-xl tracking-widest text-white mt-1">Cricket Manager</span>
            </Link>
            {!isHome && (
              <div className="hidden md:flex items-center gap-6">
                <Link href="/quick-match" className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">Quick Match</Link>
                <Link href="/draft-ai" className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">Draft vs AI</Link>
                <Link href="/career" className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">Career</Link>
                <Link href="/packs" className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">Packs</Link>
                <Link href="/my-team" className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">My Team</Link>
                <Link href="/cards" className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">Cards</Link>
                <Link href="/sbcs" className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">SBCs</Link>
                <Link href="/quests" className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">Quests</Link>
                <CoinDisplay />
              </div>
            )}
          </div>
        </nav>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/quick-match" component={QuickMatch} />
      <Route path="/match-play" component={MatchPlay} />
      <Route path="/draft-ai" component={DraftAI} />
      <Route path="/draft-2p" component={Draft2P} />
      <Route path="/career" component={CareerSetup} />
      <Route path="/career/:id">
        {(params) => <CareerDashboard id={params.id} />}
      </Route>
      <Route path="/packs" component={Packs} />
      <Route path="/my-team" component={MyTeam} />
      <Route path="/cards" component={CardDatabase} />
      <Route path="/cards/:id">
        {(params) => <PlayerDetail id={params.id} />}
      </Route>
      <Route path="/sbcs" component={SBCs} />
      <Route path="/quests" component={Quests} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
