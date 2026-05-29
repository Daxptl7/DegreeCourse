import React from 'react';
import { Link } from 'react-router-dom';

interface ErrorBoundaryState {
    hasError: boolean;
    error: any;
    errorInfo: any;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: any) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{
                    padding: '50px',
                    textAlign: 'center',
                    fontFamily: 'sans-serif',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh'
                }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#e11d48' }}>Something went wrong.</h1>
                    <p style={{ maxWidth: '600px', marginBottom: '2rem', color: '#64748b' }}>
                        We encountered an unexpected error. Please try refreshing the page or return to home.
                    </p>
                    <div style={{
                        background: '#f1f5f9',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        textAlign: 'left',
                        marginBottom: '2rem',
                        maxWidth: '800px',
                        overflow: 'auto',
                        border: '1px solid #cbd5e1'
                    }}>
                        <details style={{ cursor: 'pointer' }}>
                            <summary style={{ outline: 'none', fontWeight: '500' }}>Error Details</summary>
                            <pre style={{ marginTop: '0.5rem', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                                {this.state.error && this.state.error.toString()}
                                <br />
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    </div>

                    <a href="/" style={{
                        padding: '10px 20px',
                        background: '#2563eb',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontWeight: '500'
                    }}>
                        Return to Home
                    </a>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
