import clsx from 'clsx';

/**
 *
 * @param {Object} props
 * @param {string} props.placeholder - The placeholder text for the input field.
 * @param {boolean} props.isInvalid - A boolean indicating whether the input field is in an invalid state.
 * @param {string} props.name - The name attribute for the input field.
 * @param {boolean} props.required - A boolean indicating whether the input field is required.
 * @param {string} props.defaultValue - The default value for the input field.
 *
 * @returns  {JSX.Element} - A React component that renders a text input field with validation styling and an error message when the input is invalid.
 */

const TextField = ({
  placeholder,
  isInvalid,
  name,
  required,
  defaultValue,
}) => {
  return (
    <div className="relative flex min-w-80 flex-1 items-center">
      {isInvalid && (
        <span className="text-body-l text-red absolute right-4">
          Can’t be empty
        </span>
      )}
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className={clsx(
          'border-medium-grey/25 text-body-l w-full rounded-sm border py-2 pl-4',
          {
            'border-red pr-32': isInvalid,
            'pr-4': !isInvalid,
          }
        )}
      />
    </div>
  );
};

export default TextField;
