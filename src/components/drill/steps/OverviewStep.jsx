import { getMinOpenDate, getMinDueDate } from '../../../utils/drill/helpers';

const OverviewStep = ({
  drill,
  handleOverviewChange,
  onContinue,
  validateOverviewFields
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Drill Overview</h2>
      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Drill Title <span className="text-red-500">*</span>
        </label>
        <input 
          name="title" 
          value={drill.title} 
          onChange={handleOverviewChange} 
          className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]" 
          placeholder="Enter drill title"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Description
        </label>
        <textarea 
          name="description" 
          value={drill.description} 
          onChange={handleOverviewChange} 
          className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]" 
          placeholder="Enter drill description"
          rows="3"
          maxLength="150"
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {drill.description.length}/150
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1 font-medium">
            Open Date <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="openDate"
            value={drill.openDate}
            onChange={handleOverviewChange}
            min={getMinOpenDate()}
            className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm md:px-4 md:text-base focus:border-[#4C53B4]"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="dueDate"
            value={drill.dueDate}
            onChange={handleOverviewChange}
            min={getMinDueDate(drill.openDate)}
            className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm md:px-4 md:text-base focus:border-[#4C53B4]"
          />
        </div>
        {drill.openDate && (
          <div className="md:col-span-2">
            <div className="text-xs mt-1 text-gray-500 bg-gray-50 p-3 rounded-lg">
              {drill.dueDate ? (
                (() => {
                  const openDate = new Date(drill.openDate);
                  const dueDate = new Date(drill.dueDate);
                  const diffMinutes = Math.round((dueDate - openDate) / (1000 * 60));
                  
                  if (diffMinutes < 10) {
                    return <span className="text-red-500 font-medium">⚠️ Due date must be at least 10 minutes after open date.</span>;
                  } else if (diffMinutes < 60) {
                    return <span className="text-green-600 font-medium">✓ Due date is {diffMinutes} minutes after open date.</span>;
                  } else {
                    const diffHours = Math.round(diffMinutes / 60);
                    return <span className="text-green-600 font-medium">✓ Due date is {diffHours} hour{diffHours !== 1 ? 's' : ''} after open date.</span>;
                  }
                })()
              ) : (
                <span className="text-gray-500">Please select a due date at least 10 minutes after the open date.</span>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <button
          className="px-6 py-2 rounded-xl bg-[#4C53B4] text-white hover:bg-[#3a4095] hover:scale-105 transition"
          onClick={onContinue}
          disabled={!validateOverviewFields(drill)}
          style={{ 
            opacity: validateOverviewFields(drill) ? 1 : 0.5, 
            cursor: validateOverviewFields(drill) ? 'pointer' : 'not-allowed' 
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default OverviewStep;