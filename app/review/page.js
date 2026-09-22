"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function money(v) {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  return Number.isFinite(n)
    ? new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)
    : String(v);
}

export default function Review() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("");
  const [tier, setTier] = useState("all");
  const [confidence, setConfidence] = useState("all");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetch("/submission.json").then(r => r.json()).then(setData);
  }, []);

  const decisions = useMemo(() => {
    if (!data) return [];
    return data.decisions.filter(d => {
      const text = `${d.id} ${d.category} ${d.question} ${d.answer}`.toLowerCase();
      return (!filter || text.includes(filter.toLowerCase()))
        && (tier === "all" || d.reviewTier === tier)
        && (confidence === "all" || d.confidence === confidence);
    });
  }, [data, filter, tier, confidence]);

  if (!data) return <main><p>Loading submission…</p></main>;

  const judgments = data.decisions.filter(d => d.aiProposal !== undefined);
  const lowConfidence = data.decisions.filter(d => String(d.confidence).toLowerCase() === "low");
  const changed = judgments.filter(d => d.changedFromAI === true);
  const passed = data.reconciliations.filter(r => String(r.status).toLowerCase() === "pass");

  return (
    <main>
      <header className="topbar">
        <div>
          <div className="eyebrow">DPI-HT-01 / REVIEW</div>
          <h1>Lecturer & Auditor Review</h1>
          <p className="muted">{data.student?.name} · {data.student?.id}</p>
        </div>
        <nav><Link href="/">Dashboard</Link><a href="/submission.json" target="_blank">JSON</a></nav>
      </header>

      <section className="grid four">
        <Metric title="Decisions" value={`${data.decisions.length}`} />
        <Metric title="Material judgments" value={`${judgments.length}`} />
        <Metric title="Low confidence" value={`${lowConfidence.length}`} />
        <Metric title="Changed from AI" value={`${changed.length}`} />
      </section>

      <section className="card">
        <div className="section-title">Decision review</div>
        <div className="filters">
          <input placeholder="Search D001, question, answer…" value={filter} onChange={e => setFilter(e.target.value)} />
          <select value={tier} onChange={e => setTier(e.target.value)}>
            <option value="all">All review tiers</option>
            <option value="operational">Operational</option>
            <option value="material_judgment">Material judgment</option>
          </select>
          <select value={confidence} onChange={e => setConfidence(e.target.value)}>
            <option value="all">All confidence</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <p className="muted">Showing {decisions.length} of {data.decisions.length} decisions.</p>
        <div className="decision-list">
          {decisions.map(d => (
            <article className="decision" key={d.id}>
              <button className="decision-head" onClick={() => setExpanded(expanded === d.id ? null : d.id)}>
                <span className="decision-id">{d.id}</span>
                <span className="decision-question">{d.question}</span>
                <span className={`badge ${String(d.confidence).toLowerCase()}`}>{d.confidence}</span>
              </button>
              {expanded === d.id && (
                <div className="decision-body">
                  <p><b>Answer:</b> {d.answer}</p>
                  <p><b>Category:</b> {d.category} · <b>Tier:</b> {d.reviewTier}</p>
                  <div><b>Evidence</b><ul>{(d.evidence || []).map((e, i) => <li key={i}>{e}</li>)}</ul></div>
                  {d.aiProposal !== undefined && <Judgment d={d} />}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="grid two">
        <div className="card">
          <div className="section-title">Reconciliations</div>
          {data.reconciliations.map((r, i) => (
            <div className="recon" key={i}>
              <div><b>{r.name}</b><span className={String(r.status).toLowerCase() === "pass" ? "success" : "review"}>{r.status}</span></div>
              <div className="mono">{r.formula}</div>
              <div>{r.result}</div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="section-title">Uncertainties</div>
          {data.uncertainties.map((u, i) => <div className="uncertainty" key={i}><b>{u.name || u.title || `Item ${i+1}`}</b><p>{u.description || u.issue || JSON.stringify(u)}</p></div>)}
        </div>
      </section>

      <section className="card">
        <div className="section-title">Board recommendation</div>
        <h2>{data.boardRecommendation?.decision}</h2>
        <p><b>Corrected profit:</b> {money(data.boardRecommendation?.correctedProfit)}</p>
        <p><b>Closing cash:</b> {money(data.boardRecommendation?.closingCash)}</p>
        <div className="grid two">
          <div><b>Key warnings</b><ul>{(data.boardRecommendation?.keyWarnings || []).map((x,i)=><li key={i}>{x}</li>)}</ul></div>
          <div><b>Immediate controls</b><ul>{(data.boardRecommendation?.immediateControls || []).map((x,i)=><li key={i}>{x}</li>)}</ul></div>
        </div>
      </section>

      <footer>Source of truth: public/submission.json · {passed.length} reconciliation checks marked PASS.</footer>
    </main>
  );
}

function Judgment({ d }) {
  return <div className="judgment">
    <h4>Material judgment</h4>
    <p><b>AI proposal:</b> {d.aiProposal}</p>
    <p><b>Independent challenge:</b> {d.independentChallenge}</p>
    <p><b>Student reasoning:</b> {d.studentReasoning}</p>
    <p><b>Statement effect:</b> {d.statementEffect}</p>
    <p><b>Changed from AI:</b> {String(d.changedFromAI)}</p>
  </div>;
}

function Metric({ title, value }) {
  return <div className="metric"><div className="metric-label">{title}</div><div className="metric-value">{value}</div></div>;
}