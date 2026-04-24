interface Props { title: string; note?: string }

export const PlaceholderPage = ({ title, note }: Props) => (
  <div className="mx-auto max-w-2xl p-8 text-center">
    <h1 className="text-2xl font-bold">{title}</h1>
    <p className="mt-2 text-gray-600">{note ?? 'This screen will be built next.'}</p>
  </div>
);
