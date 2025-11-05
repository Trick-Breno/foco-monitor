import React from 'react';
import TokenManager from '@/components/features/settings/TokenManager'; // (Ou use o caminho relativo)

// Esta é a página (Server Component) que renderiza o componente de cliente
export default function SettingsPage() {
  return (
    <div className="page-container p-6"> {/* Use suas classes de layout */}
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md text-black"> {/* text-black adicionado */}
        <TokenManager />
      </div>
    </div>
  );
}

// Nota: Se você usar um alias '@' para 'src', o import fica:
// import TokenManager from '@/components/features/settings/TokenManager';
// Se não, use o caminho relativo:
// import TokenManager from '../../../../components/features/settings/TokenManager';