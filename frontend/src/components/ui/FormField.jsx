import { formField, inputStyle } from '../../styles/mixins';

/**
 * Form Field Component
 * 
 * Reusable form field combining label, input, and NES.css styling.
 * Reduces code duplication in Login/Register forms.
 * 
 * @param {string} label - Field label text
 * @param {string} id - Input ID (also used for htmlFor)
 * @param {string} type - Input type (default: "text")
 * @param {string} value - Input value
 * @param {Function} onChange - Change handler
 * @param {string} placeholder - Input placeholder text
 * @param {boolean} required - Whether field is required (default: false)
 */
export default function FormField({
    label,
    id,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false
}) {
    return (
        <div className="nes-field" style={formField}>
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                type={type}
                className="nes-input"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                style={inputStyle}
                required={required}
            />
        </div>
    );
}
