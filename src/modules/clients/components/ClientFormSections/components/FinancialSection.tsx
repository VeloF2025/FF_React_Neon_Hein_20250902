import { SectionProps, PaymentTerms, CreditRating } from '../types/clientForm.types';

export function FinancialSection({ formData, handleInputChange }: SectionProps) {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Financial Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Credit Limit (ZAR)
          </label>
          <input
            type="number"
            value={formData.creditLimit}
            onChange={(e) => handleInputChange('creditLimit', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Terms
          </label>
          <select
            value={formData.paymentTerms}
            onChange={(e) => handleInputChange('paymentTerms', e.target.value as PaymentTerms)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          >
            {Object.values(PaymentTerms).map(term => (
              <option key={term} value={term}>
                {term.replace(/_/g, ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Credit Rating
          </label>
          <select
            value={formData.creditRating}
            onChange={(e) => handleInputChange('creditRating', e.target.value as CreditRating)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          >
            {Object.values(CreditRating).map(rating => (
              <option key={rating} value={rating}>
                {rating.charAt(0).toUpperCase() + rating.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}