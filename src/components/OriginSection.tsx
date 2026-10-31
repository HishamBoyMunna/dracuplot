import { DOSSIER, ORIGIN, TIMELINE } from '../data/blackMask';
import { MaskMark } from './Marks';

export default function OriginSection() {
  return (
    <section className="section" id="origin" aria-labelledby="origin-title">
      <div className="shell">
        <div className="section-head reveal">
          <div className="gutter" aria-hidden="true">
            <span className="gutter__num">01</span>
            <span className="gutter__bar" />
          </div>
          <div>
            <p className="kicker">The man beneath the mask</p>
            <h2 className="display" id="origin-title" style={{ marginTop: 14 }}>
              {ORIGIN.headline}
            </h2>
            <p className="deck" style={{ marginTop: 16 }}>
              {ORIGIN.deck}
            </p>
          </div>
        </div>

        <div className="origin">
          <div className="reveal">
            <div className="prose">
              {ORIGIN.body.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>

            <div className="origin__note">
              <p>
                <b>False face society</b>
                <br />
                {ORIGIN.society.body}
              </p>
              <p>
                <b>The tell</b>
                <br />
                He does not need to win. He needs an audience. Every operation he has ever run leaves
                room for witnesses, and the witnesses are always the point.
              </p>
            </div>
          </div>

          <aside className="dossier reveal" aria-label="Subject dossier">
            <div className="dossier__head">
              <span>Subject dossier</span>
              <span>07-B / 01</span>
            </div>
            <div className="dossier__photo">
              <MaskMark />
              <span className="stamp stamp--sm">Black Mask</span>
            </div>
            <div className="dossier__rows">
              {DOSSIER.map((row) => (
                <div className="drow" key={row.label}>
                  <span className="drow__k">{row.label}</span>
                  {row.redacted ? (
                    <span className="drow__redact">
                      <span aria-label="redacted" role="img" />
                    </span>
                  ) : (
                    <span className="drow__v">{row.value}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="dossier__foot">
              <span>Photograph: recovered</span>
              <span>Do not copy</span>
            </div>
          </aside>
        </div>

        <figure className="pull reveal">
          <div className="gutter" aria-hidden="true">
            <span className="gutter__num">✦</span>
            <span className="gutter__bar" />
          </div>
          <div>
            <blockquote className="pull__quote">“{ORIGIN.pullQuote}”</blockquote>
            <figcaption className="pull__by">{ORIGIN.pullAttribution}</figcaption>
          </div>
        </figure>

        <div className="timeline reveal">
          <p className="kicker" style={{ marginBottom: 18 }}>
            Chronology · dates withheld by counsel
          </p>
          {TIMELINE.map((beat) => (
            <article className="beat" key={beat.title}>
              <div className="beat__mark">{beat.mark}</div>
              <div className="beat__body">
                <h3 className="beat__title">{beat.title}</h3>
                <p className="beat__text">{beat.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
