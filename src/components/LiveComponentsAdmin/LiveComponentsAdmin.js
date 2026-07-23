import ChildrenRouter from '@kne/app-children-router';
import withLocale from './withLocale';

const LiveComponentsAdminInner = ({ baseUrl = '', menu, pageProps, ...props }) => {
  return (
    <ChildrenRouter
      {...props}
      baseUrl={baseUrl}
      list={[
        {
          index: true,
          loader: () => import('./List'),
          elementProps: { menu, pageProps }
        },
        {
          path: 'detail',
          loader: () => import('./Detail'),
          elementProps: { baseUrl, pageProps }
        }
      ]}
    />
  );
};

export default withLocale(LiveComponentsAdminInner);
