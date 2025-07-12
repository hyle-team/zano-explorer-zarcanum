import { Footer } from 'zano_ui';

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
			{children}
			<Footer />
		</div>
	);
}
