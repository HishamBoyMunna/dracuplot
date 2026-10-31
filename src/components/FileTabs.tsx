const TABS = [
  { id: 'origin', num: '01', label: 'The man' },
  { id: 'target', num: '02', label: 'The target' },
  { id: 'protocol', num: '03', label: 'The protocol' },
];

/**
 * The folder itself, held in one hand. On phones the top rail's tabs are gone —
 * these are cut like index tabs and sit within thumb reach at the bottom edge.
 * Plain anchors, so the jump works without JS and the page keeps its scroll history.
 */
export default function FileTabs({ active }: { active: string }) {
  return (
    <nav className="dock" aria-label="File sections">
      <div className="dock__inner">
        {TABS.map((tab) => (
          <a
            key={tab.id}
            className="tab"
            href={`#${tab.id}`}
            aria-current={active === tab.id}
            onClick={() => {
              /* A short tick on the devices that have one. Silent everywhere else. */
              navigator.vibrate?.(8);
            }}
          >
            <span className="tab__num" aria-hidden="true">
              {tab.num}
            </span>
            <span className="tab__label">{tab.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
