import { JanusMark } from './Marks';

const TABS = [
  { id: 'origin', num: '01', label: 'The man' },
  { id: 'target', num: '02', label: 'The target' },
  { id: 'protocol', num: '03', label: 'The protocol' },
];

export default function TopRail({ active, progress }: { active: string; progress: number }) {
  return (
    <header className="rail">
      <div className="shell rail__inner">
        <a className="masthead" href="#top" aria-label="The Janus File — return to the cover">
          <JanusMark className="masthead__glyph" />
          <span className="masthead__text">
            <span className="masthead__name">Janus Cosmetics</span>
            <span className="masthead__sub">File 07-B · Internal</span>
          </span>
        </a>

        <nav className="rail__tabs" aria-label="File sections">
          {TABS.map((tab) => (
            <a key={tab.id} className="rail__tab" href={`#${tab.id}`} aria-current={active === tab.id}>
              <i aria-hidden="true">{tab.num}</i>
              {tab.label}
            </a>
          ))}
        </nav>

        <div className="rail__status">
          <span className="pip" aria-hidden="true" />
          <span className="rail__status-word">File open</span>
          <span className="rail__pct" aria-hidden="true">
            {progress}% read
          </span>
        </div>
      </div>

      <span className="rail__progress" style={{ width: `${progress}%` }} aria-hidden="true" />
    </header>
  );
}
