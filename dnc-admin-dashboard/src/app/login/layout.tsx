// app/login/layout.tsx
import React from 'react';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function LoginLayout({ children }: Props) {
  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {children}
    </div>
  );
}
