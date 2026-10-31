export default function Footer() {
  return (
    <footer className="foot">
      <div className="shell">
        <div className="foot__top">
          <div>
            <p className="foot__wordmark">Janus Cosmetics</p>
            <p className="foot__line">
              Two faces since 19██. A wholly owned subsidiary of Wayne Enterprises — a fact the
              chairman emeritus has repeatedly asked us to stop printing.
            </p>
            <span className="stamp" style={{ marginTop: 20, display: 'inline-block' }}>
              Property of the False Face Society
            </span>
          </div>

          <div className="foot__cols">
            <div>
              <p className="foot__k">The file</p>
              <div className="foot__list">
                <a href="#origin">01 — The man</a>
                <a href="#target">02 — The target</a>
                <a href="#protocol">03 — The protocol</a>
              </div>
            </div>
            <div>
              <p className="foot__k">Notice</p>
              <div className="foot__list">
                <span>No part of this document exists.</span>
                <span>If you are reading it, you are already involved.</span>
                <span>Keep it away from the press.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="foot__bottom">
          <span>An unofficial fan project · Batman and Black Mask belong to DC Comics</span>
          <span>Set in Bodoni Moda, Archivo &amp; IBM Plex Mono</span>
        </div>
      </div>
    </footer>
  );
}
