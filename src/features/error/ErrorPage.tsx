import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/ui/Layout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useErrorStore } from '../../state/errorStore';

export default function ErrorPage() {
    const navigate = useNavigate();
    const { error, clearError } = useErrorStore();

    // If no error in store, show generic error
    const title = error?.title || 'Error';
    const message = error?.message || 'Something went wrong.';
    const actionLabel = error?.actionLabel || 'Go to Sessions';
    const onAction = error?.onAction || (() => navigate('/session'));

    // Clear error when component unmounts
    useEffect(() => {
        return () => clearError();
    }, [clearError]);

    return (
        <Layout>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <Card title={title}>
                    <p style={{ marginBottom: '1.5rem' }}>{message}</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Button onClick={() => { clearError(); onAction(); }}>{actionLabel}</Button>
                        <Button variant="secondary" onClick={() => { clearError(); navigate('/login'); }}>Login</Button>
                    </div>
                </Card>
            </div>
        </Layout>
    );
}
