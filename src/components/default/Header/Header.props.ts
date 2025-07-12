import { Dispatch, SetStateAction } from 'react';
import PageState from '../../../interfaces/common/PageState';

interface HeaderProps {
	page: PageState;
	burgerOpened: boolean;
	setBurgerOpened: Dispatch<SetStateAction<boolean>>;
}

export default HeaderProps;
