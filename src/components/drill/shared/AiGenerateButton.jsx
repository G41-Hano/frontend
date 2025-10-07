const AiGenerateButton = ({ onClick, loading, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className={`px-3 py-1 rounded-lg border border-[#4C53B4] text-[#4C53B4] hover:bg-[#EEF1F5] transition ${loading ? 'opacity-50' : ''} ${className}`}
    title="Generate"
  >
    <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
  </button>
);

export default AiGenerateButton;