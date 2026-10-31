import { ArrowIcon, MaskMark } from './Marks';

export default function Cover() {
  return (
    <section id="top" className="cover plate" aria-labelledby="cover-title">
      <span className="crop crop--tl" aria-hidden="true" />
      <span className="crop crop--tr" aria-hidden="true" />
      <span className="crop crop--bl" aria-hidden="true" />
      <span className="crop crop--br" aria-hidden="true" />

      <div className="shell cover__grid">
        <div>
          <div className="cover__meta">
            <span>Janus Cosmetics</span>
            <span className="sep" aria-hidden="true" />
            <span>Annual report · FY ████</span>
            <span className="sep" aria-hidden="true" />
            <span>File 07-B</span>
          </div>

          <h1 className="cover__title" id="cover-title">
            The Janus
            <em>File</em>
          </h1>

          <p className="cover__sub">
            The planning dossier of <strong>Roman Sionis</strong> — <strong>Black Mask</strong> — kept
            in a basement that Janus Cosmetics does not list as an asset. Every page concerns one
            subject: how to take <strong>the Batman</strong> off the board, and who gets to watch.
          </p>

          <div className="cover__actions">
            <a className="btn btn--bone" href="#origin">
              Open the file
              <ArrowIcon className="btn__arrow" />
            </a>
            <a className="btn btn--outline" href="#protocol">
              Draft an operation
            </a>
          </div>

          <div className="cover__foot">
            <span>01 · The man</span>
            <span>02 · The target</span>
            <span>03 · The protocol</span>
            <span style={{ marginLeft: 'auto' }}>Gemini uplink · key optional</span>
          </div>
        </div>

        <div className="cover__art">
          <div className="cover__stamp">
            <span className="stamp">Burn after reading</span>
          </div>
          <MaskMark variant="wire" />
          <span className="cover__art-label">Fig. 1 — Sionis, R. / mask, ebony, c. 19██</span>
        </div>
      </div>
    </section>
  );
}
