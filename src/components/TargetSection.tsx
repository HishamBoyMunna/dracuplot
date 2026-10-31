import { TARGET, VECTORS, getVector } from '../data/blackMask';
import type { VectorId } from '../types/plan';
import GothamMap from './GothamMap';
import { ArrowIcon } from './Marks';

const FLAGS: Record<VectorId, string> = {
  code: 'Policy',
  family: 'Severe',
  city: 'Slow',
  fortune: 'Ledger',
  method: 'Layered',
  compassion: 'Cruel',
};

export default function TargetSection({
  vector,
  onVector,
}: {
  vector: VectorId;
  onVector: (id: VectorId) => void;
}) {
  const current = getVector(vector);

  return (
    <section className="target plate" id="target" aria-labelledby="target-title">
      <div className="shell">
        <div className="section-head reveal">
          <div className="gutter" aria-hidden="true">
            <span className="gutter__num">02</span>
            <span className="gutter__bar" />
          </div>
          <div>
            <p className="kicker kicker--red">The target · subject profile</p>
            <h2 className="display" id="target-title" style={{ marginTop: 14 }}>
              {TARGET.headline}
            </h2>
            <p className="deck" style={{ marginTop: 16 }}>
              {TARGET.deck}
            </p>
          </div>
        </div>

        <div className="target__grid">
          <div className="map-frame reveal">
            <span className="map-frame__tag">Gotham City — approach chart</span>
            <GothamMap active={vector} onSelect={onVector} />
            <span className="map-frame__scale">
              <i aria-hidden="true" />0 — 4 km
            </span>
          </div>

          <div className="reveal">
            <div className="vector-index" role="group" aria-label="Plotted vectors">
              {VECTORS.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className="vtab"
                  aria-pressed={entry.id === vector}
                  onClick={() => onVector(entry.id)}
                >
                  <span className="vtab__num">{entry.code}</span>
                  <span>
                    <span className="vtab__name">{entry.name}</span>
                    <span className="vtab__claim">{entry.claim}</span>
                  </span>
                  <span className="vtab__flag">{FLAGS[entry.id]}</span>
                </button>
              ))}
            </div>

            <div className="vector-readout" aria-live="polite">
              <div className="vector-readout__head">
                <h3 className="vector-readout__title">{current.name}</h3>
                <span className="mono" style={{ fontSize: 8, letterSpacing: '0.18em', opacity: 0.6 }}>
                  VECTOR {current.code}
                </span>
              </div>
              <div className="vector-readout__body">
                <div className="vrow">
                  <p className="vrow__k">Our read on him</p>
                  <p className="vrow__v">{current.diagnosis}</p>
                </div>
                <div className="vrow">
                  <p className="vrow__k">The approach</p>
                  <p className="vrow__v">{current.leverage}</p>
                </div>
                <div className="vrow vrow--risk">
                  <p className="vrow__k">Where it costs us</p>
                  <p className="vrow__v">{current.exposure}</p>
                </div>
              </div>
              <div className="vector-readout__foot">
                <span>
                  Asset required: <b>{current.asset}</b>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="target__foot reveal">
          <p>{TARGET.closing}</p>
          <a className="btn btn--bone btn--sm" href="#protocol">
            Carry {current.name.toLowerCase()} into the protocol
            <ArrowIcon className="btn__arrow" />
          </a>
        </div>
      </div>
    </section>
  );
}
