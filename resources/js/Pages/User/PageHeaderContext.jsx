import React, { createContext, useContext, useState, useCallback } from 'react';

export const PageHeaderContext = createContext({
    pageTitle: '',
    pageSubtitle: '',
    pageActions: null,
    setHeader: () => { },
    clearHeader: () => { },
});

export function usePageHeader() {
    return useContext(PageHeaderContext);
}

export function PageHeaderProvider({ children }) {
    const [pageTitle, setPageTitle] = useState('');
    const [pageSubtitle, setPageSubtitle] = useState('');
    const [pageActions, setPageActions] = useState(null);

    const setHeader = useCallback(({ title = '', subtitle = '', actions = null } = {}) => {
        setPageTitle(title);
        setPageSubtitle(subtitle);
        setPageActions(actions);
    }, []);

    const clearHeader = useCallback(() => {
        setPageTitle('');
        setPageSubtitle('');
        setPageActions(null);
    }, []);

    return (
        <PageHeaderContext.Provider value={{ pageTitle, pageSubtitle, pageActions, setHeader, clearHeader }}>
            {children}
        </PageHeaderContext.Provider>
    );
}