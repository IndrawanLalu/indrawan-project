// 📁 components/ErrorBoundary.jsx
// Error boundary component - file terpisah untuk JSX

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

// Error boundary HOC
export const withErrorBoundary = (Component) => {
  const WrappedComponent = function WrappedComponent(props) {
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
      const handleError = (error) => {
        setHasError(true);
        setError(error);
      };

      window.addEventListener("error", handleError);
      window.addEventListener("unhandledrejection", handleError);

      return () => {
        window.removeEventListener("error", handleError);
        window.removeEventListener("unhandledrejection", handleError);
      };
    }, []);

    if (hasError) {
      return (
        <div className="p-6 text-center bg-red-500/10 border border-red-500/20 rounded-lg">
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            Terjadi Kesalahan
          </h3>
          <p className="text-red-300 mb-4">
            {error?.message ||
              "Komponen mengalami kesalahan yang tidak terduga"}
          </p>
          <button
            onClick={() => {
              setHasError(false);
              setError(null);
            }}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      );
    }

    return <Component {...props} />;
  };

  // Set display name for debugging
  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || "Component"
  })`;

  return WrappedComponent;
};

// Basic Error Boundary Class Component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom error UI dari props jika tersedia
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }

      return (
        <div className="p-6 text-center bg-red-500/10 border border-red-500/20 rounded-lg">
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            Terjadi Kesalahan
          </h3>
          <p className="text-red-300 mb-4">
            {this.state.error?.message ||
              "Komponen mengalami kesalahan yang tidak terduga"}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// PropTypes untuk ErrorBoundary class component
ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
};

ErrorBoundary.defaultProps = {
  fallback: null,
};

// HOC dengan PropTypes yang lebih baik
export const withErrorBoundaryAdvanced = (Component, fallbackComponent) => {
  const WrappedComponent = function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallbackComponent}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  // Copy propTypes dari komponen asli
  WrappedComponent.propTypes = Component.propTypes;
  WrappedComponent.defaultProps = Component.defaultProps;
  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || "Component"
  })`;

  return WrappedComponent;
};
