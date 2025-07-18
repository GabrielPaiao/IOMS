// src/pages/NewOutageRequestPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CriticalityBadge from '../components/outageRequests/CriticalityBadge';
import type { CriticalityLevel } from '../types/outage';
import { applicationsEnvironmentsMock } from '../mocks/outageMocks';

const CRITICALITY_LEVELS: CriticalityLevel[] = ['1 (highest)', '2', '3', '4', '5 (lowest)'];

export default function NewOutageRequestPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    application: '',
    environment: '',
    location: '',
    start: '',
    end: '',
    reason: '',
    criticality: '3' as CriticalityLevel,
  });

  // Obtém os environments disponíveis para a aplicação selecionada
  const availableEnvironments = formData.application 
    ? applicationsEnvironmentsMock[formData.application as keyof typeof applicationsEnvironmentsMock] || []
    : [];

  const handleApplicationChange = (appId: string) => {
    const newEnvironments = applicationsEnvironmentsMock[appId as keyof typeof applicationsEnvironmentsMock] || [];
    setFormData({
      ...formData,
      application: appId,
      environment: newEnvironments[0] || '', // Auto-seleciona o primeiro environment
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Mock: Outage request created successfully!\n${JSON.stringify(formData, null, 2)}`);
    navigate('/outage-requests');
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">New Outage Request</h1>
        <p className="text-sm text-gray-500">Fill in all required fields to submit a new outage request</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
        {/* Título e Aplicação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title*
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
              placeholder="e.g. ERP System Maintenance"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application*
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.application}
              onChange={(e) => handleApplicationChange(e.target.value)}
              required
            >
              <option value="">Select application</option>
              <option value="ERP">ERP System</option>
              <option value="CRM">CRM Platform</option>
              <option value="HRIS">HR Information System</option>
            </select>
          </div>
        </div>

        {/* Ambiente e Localização */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Environment*
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.environment}
              onChange={(e) => setFormData({...formData, environment: e.target.value})}
              required
              disabled={!formData.application}
            >
              {availableEnvironments.length > 0 ? (
                availableEnvironments.map((env) => (
                  <option key={env} value={env}>{env}</option>
                ))
              ) : (
                <option value="">{formData.application ? 'No environments available' : 'Select an application first'}</option>
              )}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site*
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required
            >
              <option value="">Select site</option>
              <option value="GUA">Guararema (GUA)</option>
              <option value="SJC">São José dos Campos (SJC)</option>
            </select>
          </div>
        </div>

        {/* Resto do formulário permanece igual */}
        {/* Período da Outage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date & Time*
            </label>
            <input
              type="datetime-local"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.start}
              onChange={(e) => setFormData({...formData, start: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date & Time*
            </label>
            <input
              type="datetime-local"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.end}
              onChange={(e) => setFormData({...formData, end: e.target.value})}
              required
            />
          </div>
        </div>

        {/* Criticalidade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Criticality Level*
          </label>
          <div className="grid grid-cols-5 gap-2">
            {CRITICALITY_LEVELS.map((level) => (
              <label 
                key={level} 
                className={`flex items-center justify-center p-3 border rounded-md cursor-pointer ${
                  formData.criticality === level 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  checked={formData.criticality === level}
                  onChange={() => setFormData({...formData, criticality: level})}
                />
                <div className="text-center">
                  <CriticalityBadge criticality={level} />
                  <span className="block mt-1 text-xs text-gray-600">
                    {level.includes('highest') ? 'Highest' : 
                     level.includes('lowest') ? 'Lowest' : level}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Motivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Outage*
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            value={formData.reason}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
            required
            placeholder="Describe the reason for this outage request..."
          />
        </div>

        {/* Ações */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/outage-requests')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
}