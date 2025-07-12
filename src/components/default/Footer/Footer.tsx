import { classes } from '@/utils/utils';
import Link from 'next/link';
import styles from './Footer.module.scss';

type SelectedLink = 'home' | 'explorer' | 'trade' | 'auction' | 'messenger' | 'wrapped-zano';

const links: {
	title: string;
	type: SelectedLink;
	link: string;
	disabled?: boolean;
}[] = [
	{
		title: 'Zano Website',
		type: 'home',
		link: 'https://zano.org/',
	},
	{
		title: 'Explorer',
		type: 'explorer',
		link: 'https://explorer.zano.org/',
	},
	{
		title: 'Trade',
		type: 'trade',
		link: 'https://trade.zano.org/',
	},
	{
		title: 'Auction',
		type: 'auction',
		link: 'https://wrapped.zano.org/',
		disabled: true,
	},
	{
		title: 'Messenger',
		type: 'messenger',
		link: 'https://messenger.zano.org/',
		disabled: false,
	},
	{
		title: 'Wrapped Zano',
		type: 'wrapped-zano',
		link: 'https://wrapped.zano.org/',
	},
];

const selectedLink: SelectedLink = 'explorer';

function Footer() {
	return (
		<footer className={styles.footer}>
			<div className={styles.footer__refs}>
				{links.map((e) => (
					<Link
						className={classes(
							e.type === selectedLink && styles.footer__ref_selected,
							e.disabled && styles.footer__ref_disabled,
						)}
						key={e.type}
						href={e.link}
						rel="noopener noreferrer"
					>
						{e.title}
					</Link>
				))}
			</div>
			<div className={styles.footer__copyright}>
				<p>Copyright © {new Date().getFullYear()} ZANO.org</p>
			</div>
		</footer>
	);
}

export default Footer;
