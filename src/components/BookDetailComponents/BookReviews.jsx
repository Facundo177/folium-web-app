import StarIcon from "../BasicUIComponents/StarIcon";

export default function BookReviews({
  activities = [
    { id: 1, date: "Oct 24, 2023", type: "Sale", stars: 1, ref: "ORD-9921" },
    { id: 2, date: "Oct 12, 2023", type: "Restock", stars: 5, ref: "PO-441A" },
    { id: 3, date: "Sep 28, 2023", type: "Sale", stars: 2, ref: "ORD-9884" },
    {
      id: 4,
      date: "Sep 15, 2023",
      type: "Audit",
      stars: 0,
      ref: "System (J. Doe)",
    },
  ],
}) {
  return (
    <div className="border border-outline-variant bg-surface-container-lowest flex flex-col h-full font-sans shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center p-gutter border-b border-outline-variant">
        <h3 className="text-title-lg text-on-surface">Recent Reviews</h3>
        <button className="text-body-md text-on-surface-variant hover:text-on-surface flex items-center gap-1">
          View Full Ledger
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant font-medium">
                Date
              </th>
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant font-medium">
                User
              </th>
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant font-medium">
                Stars
              </th>
              <th className="py-stack-sm px-gutter text-label-caps text-on-surface-variant font-medium">
                Type
              </th>
            </tr>
          </thead>
          <tbody>
            {activities.map((item) => (
              <tr
                key={item.id}
                className="border-b border-outline-variant hover:bg-surface"
              >
                <td className="py-stack-sm px-gutter text-body-md text-on-surface">
                  {item.date}
                </td>
                <td className="py-stack-sm px-gutter">
                  <span className="border border-outline-variant px-3 py-1 text-label-caps text-on-surface-variant rounded-full">
                    {item.type}
                  </span>
                </td>
                <td
                  className={`flex py-stack-sm px-gutter text-body-md ${typeof item.stars === "number" && item.stars < 0 ? "text-error" : "text-on-surface"}`}
                >
                  {[...Array(item.stars)].map((e, i) => (
                    <span className="">
                      <StarIcon key={i} />
                    </span>
                  ))}
                </td>
                <td className="py-stack-sm px-gutter text-body-md text-on-surface-variant">
                  {item.ref}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
