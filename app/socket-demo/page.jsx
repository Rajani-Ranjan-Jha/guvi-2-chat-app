"use client";
import React from 'react';
import SocketDemo from '../components/SocketDemo';

export default function SocketDemoPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Socket.IO Real-Time Chat Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This demo showcases the real-time messaging capabilities implemented with Socket.IO. 
            Open multiple browser tabs to test real-time communication between users.
          </p>
        </div>

        <SocketDemo />

        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              How to Test Real-Time Features
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">
                  🧪 Testing Steps
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Open this page in multiple browser tabs</li>
                  <li>Join the same conversation ID in all tabs</li>
                  <li>Send messages from different tabs</li>
                  <li>Watch messages appear in real-time</li>
                  <li>Test typing indicators and online status</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-600">
                  ✨ Features to Test
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Real-time message delivery</li>
                  <li>Typing indicators</li>
                  <li>Online/offline status</li>
                  <li>Read receipts</li>
                  <li>File attachments</li>
                  <li>Automatic reconnection</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">
                🔧 Technical Details
              </h3>
              <p className="text-blue-700 text-sm">
                This demo uses WebSocket connections through Socket.IO for instant communication. 
                Messages are sent through the socket connection for real-time delivery and also 
                persisted through the REST API for data consistency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
