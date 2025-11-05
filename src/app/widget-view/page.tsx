import { Suspense } from 'react';
import WidgetLoader from '@/app/widget-view/widgetLoader'; // Vamos criar este arquivo a seguir

// Esta é a página (Server Component)
export default function WidgetPage() {
  return (
    <div className="p-4">
      <Suspense fallback={<WidgetStatus message="Carregando widget..." />}>
        <WidgetLoader />
      </Suspense>
    </div>
  );
}

// Um componente simples para exibir status
export const WidgetStatus = ({ message }: { message: string }) => {
  return (
    <div className="flex items-center justify-center h-40 bg-gray-800 rounded-lg">
      <p className="text-gray-400">{message}</p>
    </div>
  );
};