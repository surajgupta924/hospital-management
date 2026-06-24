const Input = ({ label, error, className = '', ...props }) => (
  <div className={className}>
    {label && <label className="label">{label}</label>}
    <input className={`input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} {...props} />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

export default Input;
