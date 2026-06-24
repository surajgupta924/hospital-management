import LoadingSpinner from './LoadingSpinner';

const Button = ({ children, variant = 'primary', loading, disabled, className = '', ...props }) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
  };

  return (
    <button className={`${variants[variant]} ${className}`} disabled={disabled || loading} {...props}>
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
};

export default Button;
