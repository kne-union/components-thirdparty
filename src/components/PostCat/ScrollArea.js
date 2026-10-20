import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import classnames from 'classnames';
import style from './style.module.scss';

const ScrollArea = ({ className, ...props }) => <SimpleBar {...props} className={classnames(style['scroll-area'], className)} />;

export default ScrollArea;
