export function StatDisplay({
    label,
    value,
    valueColor,
    className = '',
    unit
}: {
    label: string;
    value: string | number;
    valueColor?: string;
    className?: string;
    unit?: string;
}) {
    return (
        <div className={className}>
            <span className="text-gray-600 dark:text-gray-400">{label}:</span>
            <span className={`ml-2 font-medium ${valueColor || ''}`}>
                {value}{unit ? ` ${unit}` : ''}
            </span>
        </div>
    )
}
