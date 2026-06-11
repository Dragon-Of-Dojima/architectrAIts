type SpinnerProps = {
	label?: string;
	className?: string;
};

export default function Spinner({ label, className = '' }: SpinnerProps) {
	return (
		<div className={`flex items-center gap-3 ${className}`} role="status" aria-live="polite">
			<span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)]" />
			{label && <span className="text-sm text-muted">{label}</span>}
			<span className="sr-only">Loading…</span>
		</div>
	);
}
