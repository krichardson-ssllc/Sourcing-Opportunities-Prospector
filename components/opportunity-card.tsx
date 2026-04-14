import { OpportunityRow } from "@/types/opportunity";

function likelihoodClass(value: OpportunityRow["sourcingLikelihood"]): string {
  return value.toLowerCase();
}

type Props = {
  item: OpportunityRow;
};

export function OpportunityCard({ item }: Props) {
  return (
    <article
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>{item.companyName}</h3>
          <div style={{ color: "#6b7280", fontSize: 14 }}>
            {item.region}
          </div>
        </div>

        <div
          className={likelihoodClass(item.sourcingLikelihood)}
          style={{
            fontSize: 12,
            padding: "6px 10px",
            borderRadius: 999,
            background: "#f3f4f6",
          }}
        >
          {item.sourcingLikelihood}
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              color: "#6b7280",
              fontSize: 12,
              textTransform: "uppercase",
            }}
          >
            Likely Trigger
          </div>
          <div>{item.likelyTrigger}</div>
        </div>

        <div>
          <div
            style={{
              color: "#6b7280",
              fontSize: 12,
              textTransform: "uppercase",
            }}
          >
            Source
          </div>
          <div>{item.sourceType}</div>
        </div>

        <div>
          <div
            style={{
              color: "#6b7280",
              fontSize: 12,
              textTransform: "uppercase",
            }}
          >
            Date
          </div>
          <div>{item.sourceDate || "N/A"}</div>
        </div>
      </div>

      <p style={{ marginTop: 12 }}>{item.notes}</p>

      {item.sourceUrl ? (
        <a href={item.sourceUrl} target="_blank" rel="noreferrer">
          {item.informationSourceCitations || "View source"}
        </a>
      ) : (
        <span>{item.informationSourceCitations}</span>
      )}
    </article>
  );
}
