

export const getTodayQuery = (data) => {
    const today = new Date();
    const todayDateStr = today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');

    const response = data.filter((item) => {
        const itemDate = new Date(item.Created_at);
        const itemDateStr = itemDate.getFullYear() + '-' +
            String(itemDate.getMonth() + 1).padStart(2, '0') + '-' +
            String(itemDate.getDate()).padStart(2, '0');

        return itemDateStr === todayDateStr;
    });

    return response;
};
export const getDataInRange = (data, days) => {
    const today = new Date();
    return data?.filter((lead) => {
        const leadDate = new Date(lead.Created_at);
        return (today - leadDate) / (1000 * 60 * 60 * 24) <= days;
    }).length;
};