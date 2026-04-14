import { Opportunity } from "@/types/opportunity";

function likelihoodClass(value: Opportunity["sourcingLikelihood"]): string {
  return value.toLowerCase();
}

export function OpportunityCard({ item }: { item: Opportunity }) {
  return (
    <div className="card card-pad">
      <div className="row wrap" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 24 }}>{item.companyName}</h3>
          <div className="row wrap top-space small muted" style={{ marginTop: 8 }}>
            <span className="pill">{item.region}</span>
            <span className="pill">{item.country}</span>
            <span className="pill">{item.scienceFocus}</span>
          </div>
        </div>
        <span className={`badge ${likelihoodClass(item.sourcingLikelihood)}`}>{item.sourcingLikelihood} likelihood</span>
      </div>

      <div className="result-grid top-space">
        <div className="stat">
          <div className="small muted">Opportunity type</div>
          <div>{item.opportunityType}</div>
        </div>
        <div className="stat">
          <div className="small muted">Trigger</div>
          <div>{item.trigger}</div>
        </div>
      </div>

      <div className="stat top-space">
        <div className="small muted">Source basis</div>
        <div>{item.sourceType}</div>
        <p className="small muted" style={{ marginBottom: 0 }}>{item.summary}</p>
      </div>

      <div className="row wrap top-space small muted" style={{ justifyContent: "space-between" }}>
        <div>{item.sourceTitle} · {item.sourceDate}</div>
        <a href={item.sourceUrl} target="_blank" rel="noreferrer">Visit source</a>
      </div>
    </div>
  );
}
