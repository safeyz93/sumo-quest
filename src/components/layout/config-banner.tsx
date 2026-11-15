export function ConfigBanner() {
  return (
    <div
      role="status"
      className="border-b-[3px] border-void bg-alert px-4 py-2 text-center font-mono text-[10px] font-bold uppercase leading-relaxed tracking-[0.14em] text-void sm:text-[11px]"
    >
      Setup mode — NEXT_PUBLIC_PRIVY_APP_ID is empty, so X login is disabled.
      Fill{" "}
      <code className="border-2 border-void px-1 py-0.5">.env.local</code> and
      restart the dev server.
    </div>
  );
}
