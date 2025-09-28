"use client";
'use client'

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Demo credentials for easy access
  const demoCredentials = [
    { email: 'admin@acme.example.com', password: 'demo123!', role: 'Admin' },
    { email: 'manager@acme.example.com', password: 'demo123!', role: 'Manager' },
    { email: 'sarah@acme.example.com', password: 'demo123!', role: 'User' },
    { email: 'mike@techstart.example.com', password: 'demo123!', role: 'User' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }

    const response = await login({ email, password });
    
    if (response.success) {
      onClose();
      setEmail('');
      setPassword('');
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    
    const response = await login({ email: demoEmail, password: demoPassword });
    
    if (response.success) {
      onClose();
      setEmail('');
      setPassword('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl max-w-md w-full p-6 border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-card-foreground">Login to ComplykOrt</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-card-foreground text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-input rounded-lg text-card-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-input rounded-lg text-card-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          {(error || localError) && (
            <div className="text-destructive text-sm bg-destructive/20 border rounded-lg p-3">
              {error || localError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="border-t pt-6">
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Use demo credentials to explore:
          </p>
          <div className="grid grid-cols-1 gap-2">
            {demoCredentials.map((cred, index) => (
              <button
                key={index}
                onClick={() => handleDemoLogin(cred.email, cred.password)}
                disabled={isLoading}
                className="text-left p-3 bg-secondary hover:brightness-110 rounded-lg border transition-colors disabled:opacity-50"
              >
                <div className="text-sm text-card-foreground font-medium">{cred.email}</div>
                <div className="text-xs text-muted-foreground">{cred.role} • Click to login</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
