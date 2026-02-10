import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/ui/Layout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export default function ErrorPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const type = searchParams.get('type');
    const message = searchParams.get('message');

    let title = 'Error';
    let description = 'Something went wrong.';

    switch (type) {
        case '403':
        case 'forbidden':
            title = 'Access Denied';
            description = 'You do not have permission to access this session. It may be closed or you are not a participant.';
            break;
        case '404':
        case 'notfound':
            title = 'Session Not Found';
            description = 'The session you are looking for does not exist or has ended.';
            break;
        case '401':
        case 'unauthorized':
            title = 'Unauthorized';
            description = 'You need to be logged in to view this page.';
            break;
        default:
            if (message) description = message;
            break;
    }

    return (
        <Layout>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <Card title={title}>
                    <p style={{ marginBottom: '1.5rem' }}>{description}</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Button onClick={() => navigate('/session')}>Go to Sessions</Button>
                        <Button variant="secondary" onClick={() => navigate('/login')}>Login</Button>
                    </div>
                </Card>
            </div>
        </Layout>
    );
}
