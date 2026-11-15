import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/sections/hero";
import { QuestBoard } from "@/components/sections/quest-board";
import { TasksPreview } from "@/components/sections/tasks-preview";
import { Marquee } from "@/components/ui/marquee";

const tickerItems = [
  "SUMO // SEASON 01",
  "3+ YEAR WALLETS",
  "3 LIFTS",
  "1 WALLET",
  "NO BOTS",
  "ETHERSCAN-CHECKED",
  "MAWASHI RUN",
  "ONE ACCOUNT PER HUMAN",
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Marquee items={tickerItems} />
      <main>
        <Hero />
        <TasksPreview />
        <QuestBoard />
      </main>
      <Footer />
    </>
  );
}
