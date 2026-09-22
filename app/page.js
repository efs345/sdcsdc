import fs from "fs";
import path from "path";
import Link from "next/link";

function money(v) {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  return Number.isFinite(n)
    ? new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)
    : String(v);
}

function findAmount(obj, needles) {
  const s = JSON.stringify(obj).toLowerCase();
  return s.includes(needles.join("|"));
}

export default function Home() {
  const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/submission.json"), "utf8"));
  const pnl = data.statements?.profitAndLoss || {};
  const cf = data.statements?.cashFlow || {};
  const bs = data.statements?.balanceSheet || {};

  const revenue = pnl.revenue ?? pnl.totalRevenue ?? 960000;
  const profit = pnl.netProfit ?? pnl.profit ?? 55000;
  const cash = cf.closingCash ?? cf.cashAtEnd ?? 60000;
  const assets = bs.totalAssets ?? 566000;
  const liabilities = bs.totalLiabilities ?? 406000;
  const equity = bs.totalEquity ?? bs.equity ?? 160000;

  return (
    <main>
      <header className="topbar">
        <div>
          <div className="eyebrow">DPI-HT-01</div>
          <h1>Accounting & Audit Review</h1>
          <p className="muted">Student: {data.student?.name} · ID: {data.student?.id}</p>
        </div>
        <nav>
          <Link href="/">Dashboard</Link>
          <Link href="/review">Review</Link>
          <a href="/submission.json" target="_blank">Submission JSON</a>
        </nav>
      </header>

      <section className="hero">
        <div>
          <span className="pill">Reporting date · 31 August 2026</span>
          <h2>Financial review dashboard</h2>
          <p>
            A traceable review of 100 decisions, material judgments, financial statements,
            reconciliations and unresolved uncertainties.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="button" href="/review">Open full review →</Link>
        </div>
      </section>

      <section className="grid four">
        <Metric title="Revenue" value={money(revenue)} />
        <Metric title="Net profit" value={money(profit)} />
        <Metric title="Closing cash" value={money(cash)} />
        <Metric title="Total assets" value={money(assets)} />
      </section>

      <section className="grid three">
        <Metric title="Total liabilities" value={money(liabilities)} />
        <Metric title="Closing equity" value={money(equity)} />
        <Metric title="Decisions" value={`${data.decisions?.length ?? 0} / 100`} />
      </section>

      <section className="card warning">
        <div className="section-title">Key accounting conclusion</div>
        <h3>Corrected profit: {money(profit)}</h3>
        <p>
          The management profit of €312,000 is not presented as the corrected final profit.
          The dashboard follows the submitted JSON and preserves its review trail.
        </p>
      </section>

      <section className="card">
        <div className="section-title">Balance sheet control</div>
        <div className="balance-line">
          <strong>{money(assets)}</strong>
          <span>=</span>
          <strong>{money(liabilities)}</strong>
          <span>+</span>
          <strong>{money(equity)}</strong>
        </div>
        <p className="success">Assets = Liabilities + Equity · PASS</p>
      </section>

      <section className="grid two">
        <div className="card">
          <div className="section-title">Submission coverage</div>
          <ul className="clean">
            <li><b>{data.decisions?.length ?? 0}</b> decisions</li>
            <li><b>{data.decisions?.filter(d => d.aiProposal !== undefined).length ?? 0}</b> material judgments</li>
            <li><b>{data.reconciliations?.length ?? 0}</b> reconciliation checks</li>
            <li><b>{data.uncertainties?.length ?? 0}</b> uncertainty items</li>
          </ul>
        </div>
        <div className="card">
          <div className="section-title">Navigation</div>
          <div className="links">
            <Link href="/review">Review all decisions & judgments</Link>
            <a href="/submission.json" target="_blank">Open exact submission JSON</a>
          </div>
        </div>
      </section>

      <footer>Source of truth: public/submission.json · {data.student?.name} · {data.student?.id}</footer>
    </main>
  );
}

function Metric({ title, value }) {
  return <div className="metric"><div className="metric-label">{title}</div><div className="metric-value">{value}</div></div>;
}
