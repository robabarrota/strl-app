import { configureStore } from '@reduxjs/toolkit'
import effects from '@/redux/effects';
import reducer from '@/redux/reducer';

const effectsMiddlewares = effects.map(effect => store => next => action => {
	next(action);
	effect(store, action);
});

export default configureStore({reducer, middleware: effectsMiddlewares});
