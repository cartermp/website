export function StatDisplay({
    label,
    value,
    valueColor
}: {
    label: string;
    value: string | number;
    valueColor?: string;
}) {
    return (
        <div>
            <span className="text-gray-600 dark:text-gray-400">{label}:</span>
            <span className={`ml-2 font-medium ${valueColor || ''}`}>{value}</span>
        </div>
    )
}
