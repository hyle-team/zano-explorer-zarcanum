import Link, { LinkProps } from 'next/link';
import styles from './AliasText.module.scss';

interface AliasTextProps extends LinkProps {
	children: React.ReactNode;
}

function AliasText(props: AliasTextProps) {
	const { children, ...restProps } = props;

	return (
		<span className={styles.alias__text}>
			<Link {...restProps}>{children}</Link>
		</span>
	);
}

export default AliasText;
