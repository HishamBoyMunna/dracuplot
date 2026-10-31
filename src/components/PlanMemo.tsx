import { useEffect, useState } from 'react';
import type { BlackMaskPlan } from '../types/plan';
import { FileMark } from './Marks';

function Meter({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: 'risk' | 'collateral';
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setWidth(value));
    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  return (
    <div className={tone ? `meter meter--${tone}` : 'meter'}>
      <p className="meter__k">{label}</p>
      <p className="meter__v">
        {value}
        <span>%</span>
      </p>
      <div className="meter__track">
        <span className="meter__fill" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function draftedOn(plan: BlackMaskPlan): string {
  const stamp = plan.createdAt ?? Date.now();
  return new Date(stamp).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function PlanMemo({
  plan,
  busy,
  copied,
  onPrint,
  onCopy,
  onSample,
}: {
  plan: BlackMaskPlan | null;
  busy: boolean;
  copied: boolean;
  onPrint: () => void;
  onCopy: () => void;
  onSample: () => void;
}) {
  if (!plan) {
    return (
      <article className="memo">
        <header className="memo__head">
          <div className="memo__stampeline">
            <span>Janus Cosmetics · strategic planning</span>
            <span className="stamp stamp--sm stamp--ink stamp--flat">Draft</span>
          </div>
          <h3 className="memo__title">No operation on file</h3>
        </header>
        <div className="blank">
          {busy ? (
            <>
              <span className="spin" style={{ width: 20, height: 20, color: 'var(--red)' }} />
              <p className="blank__t">The desk is writing</p>
              <p className="blank__p">
                Reading the brief, pricing the assets, and working out how much of it he is allowed
                to survive.
              </p>
            </>
          ) : (
            <>
              <FileMark className="blank__mark" />
              <p className="blank__t">The sheet is still blank</p>
              <p className="blank__p">
                Set the terms on the left and sign it, or read the operation we keep on the premises
                for exactly this sort of evening.
              </p>
              <button type="button" className="btn btn--line btn--sm" onClick={onSample}>
                Run the sample operation
              </button>
            </>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className="memo">
      <header className="memo__head">
        <div className="memo__stampeline">
          <span>Janus Cosmetics · strategic planning</span>
          <span
            className={`stamp stamp--sm ${plan.origin === 'sample' ? 'stamp--ink' : ''}`}
            title={plan.origin === 'sample' ? 'Written in-house, no key required' : 'Generated this session'}
          >
            {plan.origin === 'sample' ? 'Sample · in house' : 'Burn after reading'}
          </span>
        </div>
        <h3 className="memo__title">Operation {plan.codename}</h3>
        <p className="memo__thesis">“{plan.thesis}”</p>
      </header>

      <div className="memo__body">
        <div className="meters">
          <Meter label="Probability" value={plan.successProbability} />
          <Meter label="Exposure" value={plan.exposureRisk} tone="risk" />
          <Meter label="Collateral" value={plan.collateral} tone="collateral" />
        </div>

        <section aria-label="Sequence of phases">
          <div className="memo__section-k">
            <span>01 — Sequence</span>
            <span>{plan.vector}</span>
          </div>
          <div className="phases">
            {plan.phases.map((phase, index) => (
              <div className="phase" key={`${phase.name}-${index}`}>
                <div className="phase__num" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div>
                  <p className="phase__name">
                    <span>{phase.name}</span>
                    {phase.window ? <span className="phase__window">{phase.window}</span> : null}
                  </p>
                  <p className="phase__objective">{phase.objective}</p>
                  {phase.actions.length > 0 ? (
                    <ul className="phase__actions">
                      {phase.actions.map((action) => (
                        <li key={action}>{action}</li>
                      ))}
                    </ul>
                  ) : null}
                  {phase.asset ? (
                    <p className="phase__asset">
                      Asset — <b>{phase.asset}</b>
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        {plan.assets.length > 0 ? (
          <section aria-label="Assets committed">
            <div className="memo__section-k">
              <span>02 — Assets committed</span>
              <span>{plan.assets.length} line items</span>
            </div>
            <table className="ledger">
              <thead>
                <tr>
                  <th scope="col">Asset</th>
                  <th scope="col" style={{ textAlign: 'right' }}>
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.assets.map((asset) => (
                  <tr key={asset.name}>
                    <td>
                      {asset.name}
                      {asset.role ? (
                        <span style={{ display: 'block', color: 'var(--ink-faint)', fontSize: 8.5 }}>
                          {asset.role}
                        </span>
                      ) : null}
                    </td>
                    <td>{asset.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        {plan.contingencies.length > 0 ? (
          <section aria-label="Contingencies">
            <div className="memo__section-k">
              <span>03 — If he does this</span>
              <span>Contingency</span>
            </div>
            {plan.contingencies.map((item) => (
              <div className="contingency" key={item.trigger}>
                <span className="contingency__bar" aria-hidden="true" />
                <div>
                  <p className="contingency__t">{item.trigger}</p>
                  <p className="contingency__r">{item.response}</p>
                </div>
              </div>
            ))}
          </section>
        ) : null}

        <div className="failure">
          <p className="failure__k">Most likely way this ends badly</p>
          <p>{plan.failureMode}</p>
        </div>

        {plan.closingLine ? (
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: '1.06rem',
              lineHeight: 1.4,
              color: 'var(--ink)',
            }}
          >
            {plan.closingLine}
          </p>
        ) : null}

        <div className="memo__sign">
          <div>
            <p className="memo__sign-line">R. Sionis</p>
            <p
              className="mono"
              style={{
                fontSize: 7.5,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--ink-faint)',
                marginTop: 6,
              }}
            >
              Chairman emeritus · Janus Cosmetics
            </p>
          </div>
          <div className="memo__sign-meta">
            Drafted {draftedOn(plan)}
            <br />
            {plan.origin === 'gemini' ? `Gemini · ${plan.model ?? 'uplink'}` : 'Written in-house'}
          </div>
        </div>
      </div>

      <footer className="memo__foot">
        <span className="memo__foot-meta">
          {plan.phases.length} phases · {plan.assets.length} assets · {plan.contingencies.length}{' '}
          contingencies
        </span>
        <div className="no-print" style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="btn btn--line btn--sm" onClick={onCopy}>
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button type="button" className="btn btn--line btn--sm" onClick={onPrint}>
            Print
          </button>
        </div>
      </footer>
    </article>
  );
}
