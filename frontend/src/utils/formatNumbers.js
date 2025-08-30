/**
 * Convierte un número en una cadena con formato de moneda, utilizando el formato de moneda del Paraguay.
 * @param {number} number - El número a convertir.
 * @return {string} - La cadena formateada con el número y el símbolo de moneda.
 */
export const formatNumber = (number) => {
    return number.toLocaleString('es-PY', { style: 'currency', currency: 'PYG' })
}

/**
 * Convierte una cadena con formato de moneda en un número.
 * @param {string} number - La cadena con formato de moneda a convertir.
 * @return {number} - El número resultante de la conversión, sin el símbolo de moneda y sin separador de miles.
 */
export const disFormatNumber = (number) => {
    return parseFloat(number.replace(/,/g, '').replace('PYG', ''))
}