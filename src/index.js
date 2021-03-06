
import { createContext, useContext, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';
import { bindActionCreators } from 'redux';
import shallowEqual from 'shallowequal';

export const ReduxContext = createContext();

ReduxContext.displayName = 'ReduxContext';

export const reduxBatchUpdateMiddleware = ({dispatch, getState}) => next => action => {
    let retVal;
    batchedUpdates(() => retVal = next(action));
    return retVal;
}

const useRefState = initialValue => {

    const [state, setState] = useState(initialValue);
    const stateRef = useRef();

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    return [state, setState, stateRef];
};

export const useReduxState = (selector, memoArray) => {

    const store = useContext(ReduxContext);
    const selectorCb = useCallback(selector, memoArray);
    const selectorCbFn = () => selectorCb;
    const select = () => selectorCb(store.getState());
    const [state, setState, stateRef] = useRefState(select);
    const [prevStore, setPrevStore] = useState(store);
    const [prevSelectorCb, setPrevSelectorCb] = useState(selectorCbFn);
    if(store !== prevStore || selectorCb !== prevSelectorCb) {
        setPrevStore(store);
        setPrevSelectorCb(selectorCbFn);
        setState(select());
    }
    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            const newState = selectorCb(store.getState());
            if(!shallowEqual(stateRef.current, newState)) {
                setState(newState);
            }
        });
        return unsubscribe;
    },[store, selectorCb]);
    return state;
};

export const useReduxDispatch = (fn, memoArray) => {
    
    const { dispatch } = useContext(ReduxContext);
    return useMemo(() => fn ? fn(dispatch) : dispatch, memoArray ? [dispatch, ...memoArray] : [dispatch]);
};

export const useReduxBindActionCreators = (actionCreators, memoArray) => {

    const { dispatch } = useContext(ReduxContext);    
    return useMemo(() => bindActionCreators(actionCreators, dispatch), memoArray ? [dispatch, ...memoArray] : [dispatch]);
};
