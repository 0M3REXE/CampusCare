// Temporary placeholder page to satisfy Next.js & TypeScript module requirements.
// TODO: Replace with real student dashboard implementation or remove if obsolete.
'use client';

export function StendDashboardPageInner() {
	return (
		<div style={{ padding: '1rem' }}>
			<h1>Student Dashboard (Placeholder)</h1>
			<p>This placeholder exists because the original file was empty, which caused a TypeScript build error.</p>
		</div>
	);
}

export default function StendDashboardPage() {
	return <StendDashboardPageInner />;
}

export const metadata = {} as const; // explicit export so file is treated as module

