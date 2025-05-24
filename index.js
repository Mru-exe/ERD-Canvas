import Router from './Router.js';

const routes = {
    '/': () => import('./views/LandingView.js'),
    '/diagram':() => import('./views/AppView.js')
};

const router = new Router('root-container', routes);
router.start();