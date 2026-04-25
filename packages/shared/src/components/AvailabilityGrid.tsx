const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOTS = ['Morning', 'Afternoon', 'Evening'];

export type AvailabilityMap = Record<string, string[]>;

interface Props {
  value: AvailabilityMap;
  onChange: (next: AvailabilityMap) => void;
  readOnly?: boolean;
}

export const AvailabilityGrid = ({ value, onChange, readOnly }: Props) => {
  const toggle = (day: string, slot: string) => {
    if (readOnly) return;
    const current = value[day] ?? [];
    const next = current.includes(slot) ? current.filter((s) => s !== slot) : [...current, slot];
    onChange({ ...value, [day]: next });
  };

  const markAll = () => {
    const next: AvailabilityMap = {};
    DAYS.forEach((d) => (next[d] = [...SLOTS]));
    onChange(next);
  };

  return (
    <div>
      {!readOnly && (
        <div className="mb-2 flex justify-end">
          <button type="button" onClick={markAll} className="text-sm text-brand-400 hover:underline">
            Mark all available
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-center text-sm">
          <thead>
            <tr className="bg-surface">
              <th className="border p-2 text-left font-medium">Day</th>
              {SLOTS.map((s) => <th key={s} className="border p-2 font-medium">{s}</th>)}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr key={day}>
                <td className="border p-2 text-left font-medium">{day}</td>
                {SLOTS.map((slot) => {
                  const on = value[day]?.includes(slot);
                  return (
                    <td key={slot} className="border p-1">
                      <button
                        type="button"
                        disabled={readOnly}
                        onClick={() => toggle(day, slot)}
                        className={`w-full rounded-md px-2 py-2 text-xs ${
                          on ? 'bg-brand-400 text-black' : 'bg-elev text-gray-400 hover:bg-line'
                        } ${readOnly ? 'cursor-default' : ''}`}
                      >
                        {on ? '✓ Available' : 'Off'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
