export const formatDate = (date: string): string => {
    const d = new Date(date);
    // Ensure we handle timezone correctly and get local date
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // +1 because months are 0-indexed
    const year = d.getFullYear();
    
    return `${day}.${month}.${year}`;
  };