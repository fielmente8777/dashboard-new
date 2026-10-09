const FormField = ({ label, htmlFor, error, children }) => {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-app-text">
        {label}
      </label>

      {children}

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
