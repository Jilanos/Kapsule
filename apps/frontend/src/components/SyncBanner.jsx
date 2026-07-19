/**
 * Bandeau "non synchronise" avec action de reessai (audit 2026-07-18, AC9).
 * Une ecriture optimiste dont la persistance a echoue est signalee ici plutot
 * que perdue en console ; l'utilisateur peut relancer la synchronisation.
 * @param {{ error: { message: string, retry: () => void } | null }} props
 */
export function SyncBanner({ error }) {
  if (!error) return null;
  return (
    <div className="sync-status" role="alert">
      <span>{error.message}</span>
      <button type="button" onClick={error.retry}>
        Reessayer
      </button>
    </div>
  );
}
