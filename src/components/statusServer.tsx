interface StatusProps {
  isOnline: boolean;
  isSyncing: boolean;
}

export default function ServerStatus ({ isOnline, isSyncing }: StatusProps) {

  /* Componente de estado del servidor */
  return (
    <div className="flex items-center gap-4 bg-white p-2 px-4 rounded-full shadow-sm border border-gray-100">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} ${isSyncing ? 'animate-pulse' : ''}`}></div>
        <span className="text-sm font-bold text-gray-700">
          {isOnline ? 'CONECTADO' : 'MODO OFFLINE'}
        </span>
      </div>
      {isSyncing && <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Sincronizando...</span>}
    </div>
  );
}