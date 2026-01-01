import { useState } from 'react';

const useForm = (initialValues, validate = () => {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleSubmit = (callback) => (e) => {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      callback(); // run callback if no errors
    }
  };

  return { values, errors, handleChange, handleSubmit };
};

export default useForm;
