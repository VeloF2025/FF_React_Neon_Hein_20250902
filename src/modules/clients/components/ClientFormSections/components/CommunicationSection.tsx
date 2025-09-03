import { SectionProps, ContactMethod } from '../types/clientForm.types';

export function CommunicationSection({ formData, handleInputChange }: SectionProps) {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Communication Preferences</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Contact Method
          </label>
          <select
            value={formData.preferredContactMethod}
            onChange={(e) => handleInputChange('preferredContactMethod', e.target.value as ContactMethod)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          >
            {Object.values(ContactMethod).map(method => (
              <option key={method} value={method}>
                {method.replace(/_/g, ' ').charAt(0).toUpperCase() + method.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <input
            type="text"
            value={formData.communicationLanguage}
            onChange={(e) => handleInputChange('communicationLanguage', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timezone
          </label>
          <input
            type="text"
            value={formData.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}