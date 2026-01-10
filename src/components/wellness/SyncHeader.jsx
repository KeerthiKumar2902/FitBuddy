import React from 'react';

const SyncHeader = ({ isConnected, lastSynced, onConnect, onSync, isSyncing }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-4">
        {/* Animated Icon Container */}
        <div className={`p-3 rounded-full ${isConnected ? 'bg-teal-50' : 'bg-gray-100'} relative`}>
          {isSyncing && (
            <div className="absolute inset-0 rounded-full border-2 border-teal-400 border-t-transparent animate-spin"></div>
          )}
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isConnected ? 'text-teal-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        <div>
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            Device Sync
            {isConnected && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Active</span>}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                Last synced: <span className="font-medium text-gray-700">{lastSynced || 'Never'}</span>
              </>
            ) : (
              'Connect a device to auto-track steps, sleep & heart rate'
            )}
          </p>
        </div>
      </div>

      <div>
        {isConnected ? (
          <button 
            onClick={onSync}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all transform active:scale-95 ${
              isSyncing 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        ) : (
          <button 
            onClick={onConnect}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 fill-current text-[#00B0B9]" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-3 16.5c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zm3-2.5c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm3-2.5c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5z"/></svg>
            Connect Fitbit
          </button>
        )}
      </div>
    </div>
  );
};

export default SyncHeader;