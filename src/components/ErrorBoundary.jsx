import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-fc-dark text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-fc-coral/20 text-fc-coral flex items-center justify-center text-2xl font-bold mb-4">
            ⚠️
          </div>
          <h2 className="text-xl font-bold mb-2">Ops! Algo deu errado ao carregar.</h2>
          <p className="text-sm text-white/70 max-w-md mb-4">
            Ocorreu um erro inesperado ao renderizar a tela.
          </p>
          {this.state.error && (
            <div className="bg-black/40 border border-white/15 rounded-xl p-3 max-w-md w-full mb-6 text-left overflow-x-auto text-[11px] font-mono text-amber-300">
              <p className="font-bold text-fc-coral mb-1">{String(this.state.error.name)}: {String(this.state.error.message)}</p>
              {this.state.error.stack && (
                <p className="text-white/60 text-[10px] whitespace-pre-wrap truncate max-h-32 overflow-y-auto">
                  {this.state.error.stack}
                </p>
              )}
            </div>
          )}
          <button
            onClick={this.handleReload}
            className="bg-fc-lime text-fc-dark font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-fc-lime/90 transition active:scale-95 text-sm"
          >
            🔄 Recarregar Aplicativo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
