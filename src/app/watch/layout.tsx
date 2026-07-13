import { WatchFrame } from "@/components/watch/WatchFrame";

export default function WatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WatchFrame>{children}</WatchFrame>;
}
