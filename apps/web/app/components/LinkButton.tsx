import Link from 'next/link';
import type { ReactNode } from 'react';

const base =
	'inline-flex items-center justify-center rounded-md px-4 py-2 font-serif text-sm font-medium transition';

type LinkButtonProps = {
	href?: string;
	children: ReactNode;
	disabled?: boolean;
	className?: string;
};

export default function LinkButton({ href, children, disabled = false, className = '' }: LinkButtonProps) {
	if (disabled || !href) {
		return (
			<span
				aria-disabled="true"
				className={`${base} cursor-not-allowed bg-[var(--btn)] text-[var(--btn-fg)] opacity-50 ${className}`}
			>
				{children}
			</span>
		);
	}
	return (
		<Link
			href={href}
			className={`${base} bg-[var(--btn)] text-[var(--btn-fg)] hover:bg-[var(--btn-hover)] ${className}`}
		>
			{children}
		</Link>
	);
}
