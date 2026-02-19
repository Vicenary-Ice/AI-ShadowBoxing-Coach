import { ReactNode, useState } from "react";

interface SegmentedControlProps {
  tabs: string[];
  children: ReactNode[];
}

const SegmentedControl = ({ tabs, children }: SegmentedControlProps) => {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="flex bg-secondary rounded-lg p-1 mb-5">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActive(i)}
            className={`flex-1 text-sm font-semibold py-2.5 rounded-md transition-all duration-200 ${
              active === i
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="page-enter">{children[active]}</div>
    </div>
  );
};

export default SegmentedControl;
