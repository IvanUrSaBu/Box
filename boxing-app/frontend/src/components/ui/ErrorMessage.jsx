import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './alert';

const ErrorMessage = ({ error, className }) => {
  const getErrorMessage = (error) => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    return 'Ha ocurrido un error inesperado';
  };

  if (!error) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {getErrorMessage(error)}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorMessage;

