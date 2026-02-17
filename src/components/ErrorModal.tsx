import React from 'react';
import { useErrorStore } from '../state/errorStore';
import { Button } from './ui/Button';
import './ErrorModal.module.scss';

export function ErrorModal() {
    const { error, clearError } = useErrorStore();

    if (!error) return null;

    return (
        <div className="modal-overlay" onClick={clearError}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{error.title}</h2>
                    <button className="modal-close" onClick={clearError}>×</button>
                </div>
                <div className="modal-body">
                    <p>{error.message}</p>
                </div>
                <div className="modal-footer">
                    {error.actionLabel && error.onAction ? (
                        <>
                            <Button onClick={() => { error.onAction!(); clearError(); }}>
                                {error.actionLabel}
                            </Button>
                            <Button variant="secondary" onClick={clearError}>
                                Dismiss
                            </Button>
                        </>
                    ) : (
                        <Button onClick={clearError}>OK</Button>
                    )}
                </div>
            </div>
        </div>
    );
}
