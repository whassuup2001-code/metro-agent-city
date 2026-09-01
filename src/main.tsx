import React from 'react';
import ReactDOM from 'react-dom/client';
import { PhantomProvider, darkTheme, AddressType } from '@phantom/react-sdk';
import { App } from './App';
import './index.css';

class SafeErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("Caught top-level provider error, rendering core application fallback:", error);
  }

  render() {
    if (this.state.hasError) {
      return <App />;
    }
    return this.props.children;
  }
}

const phantomConfig = {
  providers: ['google', 'apple', 'injected'] as const,
  appId: '51ba3540-2bc7-45c7-8334-442df9dc6b19',
  addressTypes: [AddressType.solana, AddressType.ethereum, AddressType.sui],
  authOptions: {
    redirectUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SafeErrorBoundary>
      <PhantomProvider
        config={phantomConfig as any}
        theme={darkTheme}
        appIcon=""
        appName="Metro Agents: Autonomous"
      >
        <App />
      </PhantomProvider>
    </SafeErrorBoundary>
  </React.StrictMode>,
);

