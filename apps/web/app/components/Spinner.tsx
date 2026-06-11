type SpinnerProps = {
	label?: string;
	className?: string;
};

export default function Spinner({ label, className = '' }: SpinnerProps) {
	return (
		<div className={`flex items-center gap-3 ${className}`} role="status" aria-live="polite">
			<span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
			{label && <span className="text-sm text-gray-600">{label}</span>}
			<span className="sr-only">Loading…</span>
		</div>
	);
}
