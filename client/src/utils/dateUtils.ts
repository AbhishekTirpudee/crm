export const formatDate = (dateString?: string | Date | null): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) return '-';

    return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).replace(/\//g, ':').replace(',', '');
};
