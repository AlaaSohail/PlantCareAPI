const getNextDate = (currentDate, repeatType) => {

    const nextDate = new Date(currentDate);

    switch (repeatType) {

        case "daily":
            nextDate.setDate(nextDate.getDate() + 1);
            break;

        case "weekly":
            nextDate.setDate(nextDate.getDate() + 7);
            break;

        case "monthly":
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;

        default:
            return null;
    }

    return nextDate;
};

module.exports = {
    getNextDate
};