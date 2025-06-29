/**
 * Преобразует таймстамп в строку формата "ДД.ММ.ГГГГ"
 * @param timestamp - Таймстамп в миллисекундах или объект Date
 * @returns Строка с датой в формате "ДД.ММ.ГГГГ"
 */
export const formatDate = (timestamp: number | Date): string => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // +1, т.к. месяцы начинаются с 0
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
};
