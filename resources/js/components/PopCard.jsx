import { useEffect, useId } from 'react';
import Button from './Button';
import ButtonGray from './ButtonGray';
import Icon from './Icons';

export default function PopCard({
	title,
	description = null,
	onCancel = null,
	onDone = null,
	doneLabel = 'Selesai',
	doneDisabled = false,
	doneVariant = 'primary',
	onClose,
	children,
	className = '',
}) {
	const titleId = useId();
	const actions = (typeof onCancel === 'function' || typeof onDone === 'function') && (
		<div className="mt-8 flex justify-end gap-4">
			{typeof onCancel === 'function' && <ButtonGray type="button" onClick={onCancel}>Batal</ButtonGray>}
			{typeof onDone === 'function' && <Button type="submit" variant={doneVariant} disabled={doneDisabled}>{doneLabel}</Button>}
		</div>
	);
	const content = typeof onDone === 'function'
		? <form onSubmit={onDone}>{children}{actions}</form>
		: <>{children}{actions}</>;

	useEffect(() => {
		function handleKeyDown(event) {
			if (event.key === 'Escape') onClose();
		}

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [onClose]);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
			onMouseDown={event => {
				if (event.target === event.currentTarget) onClose();
			}}
		>
            {/* HEADER */}
			<section
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				className={`border border-green-light-03 bg-white-01 relative w-full max-w-md rounded-lg p-6 shadow-xl ${className}`}
			>

                {/* TOMBOL */}
				<div className="mb-2 flex items-center justify-between">
					<h2 id={titleId} className="text-lg font-semibold text-teal-darker">{title}</h2>
					<button
						type="button"
						onClick={onClose}
						aria-label="Tutup"
						className="rounded p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
					>
						<Icon name="close" className="h-5 w-5" />
					</button>
				</div>

                {/* KONTEN */}
				{description != null && description !== '' && <p className="mb-5 text-sm text-gray-600">{description}</p>}
				{content}
			</section>
		</div>
	);
}